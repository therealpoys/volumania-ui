import { z } from "zod";

// PVC (Persistent Volume Claim) schema
export const pvcSchema = z.object({
  id: z.string(),
  name: z.string(),
  namespace: z.string(),
  size: z.string(), // e.g., "10Gi"
  usedBytes: z.number(),
  totalBytes: z.number(),
  usagePercent: z.number(),
  status: z.enum(["Bound", "Pending", "Lost"]),
  storageClass: z.string(),
  accessModes: z.array(z.string()),
  hasAutoscaler: z.boolean(),
  createdAt: z.string(),
});

// AutoScaler schema for Volumania
export const autoScalerSchema = z.object({
  id: z.string(),
  name: z.string(),
  namespace: z.string(),
  pvcName: z.string(),
  minSize: z.string(), // e.g., "1Gi"
  maxSize: z.string(), // e.g., "100Gi"
  stepSize: z.string(), // e.g., "5Gi"
  triggerAbovePercent: z.number(),
  checkIntervalSeconds: z.number(),
  cooldownSeconds: z.number(),
  status: z.enum(["Active", "Inactive", "Error"]),
  lastScaleTime: z.string().optional(),
  createdAt: z.string(),
});

// Insert schemas for forms
export const insertAutoScalerSchema = autoScalerSchema.omit({
  id: true,
  status: true,
  lastScaleTime: true,
  createdAt: true,
});

export type PVC = z.infer<typeof pvcSchema>;
export type AutoScaler = z.infer<typeof autoScalerSchema>;
export type InsertAutoScaler = z.infer<typeof insertAutoScalerSchema>;
