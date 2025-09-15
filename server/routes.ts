import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { k8sClient } from "./kubernetes";
import { insertAutoScalerSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // PVC Routes
  app.get("/api/pvcs", async (req, res) => {
    try {
      const pvcs = await k8sClient.getAllPVCs();
      res.json(pvcs);
    } catch (error) {
      console.error("Error fetching PVCs:", error);
      res.status(500).json({ 
        error: "Failed to fetch PVCs",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/pvcs/:namespace/:name", async (req, res) => {
    try {
      const { namespace, name } = req.params;
      const pvc = await k8sClient.getPVCWithUsage(name, namespace);
      
      if (!pvc) {
        return res.status(404).json({ error: "PVC not found" });
      }
      
      res.json(pvc);
    } catch (error) {
      console.error("Error fetching PVC:", error);
      res.status(500).json({ 
        error: "Failed to fetch PVC",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AutoScaler Routes
  app.get("/api/autoscalers", async (req, res) => {
    try {
      const k8sAutoScalers = await k8sClient.getAllAutoScalers();
      const storageAutoScalers = await storage.getAllAutoScalers();
      
      // Combine data from both sources
      const allAutoScalers = [
        ...k8sAutoScalers.map((as: any) => ({
          id: `k8s-${as.metadata.namespace}-${as.metadata.name}`,
          name: as.metadata.name,
          namespace: as.metadata.namespace,
          pvcName: as.spec.pvcName,
          minSize: as.spec.minSize,
          maxSize: as.spec.maxSize,
          stepSize: as.spec.stepSize,
          triggerAbovePercent: as.spec.triggerAbovePercent,
          checkIntervalSeconds: as.spec.checkIntervalSeconds,
          cooldownSeconds: as.spec.cooldownSeconds,
          status: as.status?.phase || "Active",
          lastScaleTime: as.status?.lastScaleTime,
          createdAt: as.metadata.creationTimestamp,
        })),
        ...storageAutoScalers
      ];
      
      res.json(allAutoScalers);
    } catch (error) {
      console.error("Error fetching autoscalers:", error);
      res.status(500).json({ 
        error: "Failed to fetch autoscalers",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/autoscalers", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertAutoScalerSchema.parse(req.body);
      
      // Try to create the AutoScaler in Kubernetes first
      try {
        const k8sAutoScaler = await k8sClient.createPVCAutoScaler(validatedData);
        
        // Also store in our local storage for tracking
        const localAutoScaler = await storage.createAutoScaler(validatedData);
        
        res.status(201).json({
          success: true,
          autoScaler: localAutoScaler,
          k8sResource: k8sAutoScaler
        });
      } catch (k8sError) {
        console.warn("Failed to create K8s AutoScaler, storing locally only:", k8sError);
        
        // Fallback to local storage only
        const localAutoScaler = await storage.createAutoScaler(validatedData);
        
        res.status(201).json({
          success: true,
          autoScaler: localAutoScaler,
          warning: "Created locally but failed to create Kubernetes resource"
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      
      console.error("Error creating autoscaler:", error);
      res.status(500).json({ 
        error: "Failed to create autoscaler",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/autoscalers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const autoScaler = await storage.getAutoScaler(id);
      
      if (!autoScaler) {
        return res.status(404).json({ error: "AutoScaler not found" });
      }
      
      res.json(autoScaler);
    } catch (error) {
      console.error("Error fetching autoscaler:", error);
      res.status(500).json({ 
        error: "Failed to fetch autoscaler",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/autoscalers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAutoScaler(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "AutoScaler not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting autoscaler:", error);
      res.status(500).json({ 
        error: "Failed to delete autoscaler",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
