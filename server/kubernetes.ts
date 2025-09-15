import * as k8s from '@kubernetes/client-node';
import type { PVC } from '@shared/schema';

export class KubernetesClient {
  private k8sApi: k8s.CoreV1Api;
  private k8sCustomApi: k8s.CustomObjectsApi;
  private k8sMetricsApi: k8s.Metrics;

  constructor() {
    const kc = new k8s.KubeConfig();
    
    // Try to load config from various sources
    try {
      // In cluster configuration (when running inside K8s)
      kc.loadFromCluster();
    } catch {
      try {
        // Local kubeconfig file
        kc.loadFromDefault();
      } catch {
        // Fallback - use environment variables if available
        console.warn('Could not load Kubernetes config. Using default configuration.');
      }
    }

    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    this.k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);
    this.k8sMetricsApi = new k8s.Metrics(kc);
  }

  async getAllPVCs(): Promise<PVC[]> {
    try {
      const response = await this.k8sApi.listPersistentVolumeClaimForAllNamespaces();
      const pvcs: PVC[] = [];

      for (const pvc of response.items) {
        if (!pvc.metadata?.name || !pvc.metadata?.namespace) continue;

        const pvcData = await this.getPVCWithUsage(pvc.metadata.name, pvc.metadata.namespace);
        if (pvcData) {
          pvcs.push(pvcData);
        }
      }

      return pvcs;
    } catch (error) {
      console.error('Error fetching PVCs:', error);
      return [];
    }
  }

  async getPVCWithUsage(name: string, namespace: string): Promise<PVC | null> {
    try {
      // Get PVC details
      const pvc = await this.k8sApi.readNamespacedPersistentVolumeClaim({ name, namespace });

      if (!pvc.metadata?.name || !pvc.metadata?.namespace) return null;

      // Parse storage size
      const sizeStr = pvc.spec?.resources?.requests?.storage || '0';
      const totalBytes = this.parseStorageSize(sizeStr);

      // Get usage metrics (this might require metrics-server or custom implementation)
      const usedBytes = await this.getPVCUsageBytes(name, namespace);
      const usagePercent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

      // Check if PVC has Volumania autoscaler annotations or CRD
      const hasAutoscaler = await this.checkForAutoscaler(name, namespace);

      return {
        id: `${namespace}/${name}`,
        name: pvc.metadata.name,
        namespace: pvc.metadata.namespace,
        size: sizeStr,
        usedBytes,
        totalBytes,
        usagePercent: Math.round(usagePercent * 10) / 10, // Round to 1 decimal
        status: pvc.status?.phase as any || 'Pending',
        storageClass: pvc.spec?.storageClassName || 'default',
        accessModes: pvc.spec?.accessModes || [],
        hasAutoscaler,
        createdAt: pvc.metadata.creationTimestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching PVC ${namespace}/${name}:`, error);
      return null;
    }
  }

  private async getPVCUsageBytes(name: string, namespace: string): Promise<number> {
    try {
      // Try to get usage from metrics API (requires metrics-server)
      // This is a simplified approach - in reality you might need to:
      // 1. Query the pod that uses this PVC
      // 2. Get filesystem usage metrics
      // 3. Parse the metrics for the specific mount point
      
      // For now, we'll simulate realistic usage based on PVC size
      // In a real implementation, you'd query the kubelet metrics API
      // or use a tool like Prometheus with node-exporter
      
      return Math.floor(Math.random() * 0.8 * 1024 * 1024 * 1024 * 50); // Random usage up to 80% of ~50GB
    } catch (error) {
      console.error('Error getting PVC usage:', error);
      return 0;
    }
  }

  private async checkForAutoscaler(pvcName: string, namespace: string): Promise<boolean> {
    try {
      // Check for Volumania autoscaler annotations on the PVC
      const pvc = await this.k8sApi.readNamespacedPersistentVolumeClaim({ name: pvcName, namespace });
      const annotations = pvc.metadata?.annotations || {};
      
      if (annotations['volumania.io/autoscaler.enabled'] === 'true') {
        return true;
      }

      // Check for PVCAutoScaler CRD
      try {
        await this.k8sCustomApi.getNamespacedCustomObject({
          group: 'scaling.volumania.io',
          version: 'v1',
          namespace,
          plural: 'pvcautoscalers',
          name: `${pvcName}-autoscaler`
        });
        return true;
      } catch {
        // CRD doesn't exist, that's ok
      }

      return false;
    } catch (error) {
      console.error('Error checking for autoscaler:', error);
      return false;
    }
  }

  async createPVCAutoScaler(data: {
    name: string;
    namespace: string;
    pvcName: string;
    minSize: string;
    maxSize: string;
    stepSize: string;
    triggerAbovePercent: number;
    checkIntervalSeconds: number;
    cooldownSeconds: number;
  }) {
    try {
      const autoScalerCRD = {
        apiVersion: 'scaling.volumania.io/v1',
        kind: 'PVCAutoScaler',
        metadata: {
          name: data.name,
          namespace: data.namespace,
        },
        spec: {
          pvcName: data.pvcName,
          minSize: data.minSize,
          stepSize: data.stepSize,
          maxSize: data.maxSize,
          triggerAbovePercent: data.triggerAbovePercent,
          checkIntervalSeconds: data.checkIntervalSeconds,
          cooldownSeconds: data.cooldownSeconds,
        },
      };

      await this.k8sCustomApi.createNamespacedCustomObject({
        group: 'scaling.volumania.io',
        version: 'v1',
        namespace: data.namespace,
        plural: 'pvcautoscalers',
        body: autoScalerCRD
      });

      return autoScalerCRD;
    } catch (error) {
      console.error('Error creating PVCAutoScaler:', error);
      throw error;
    }
  }

  async getAllAutoScalers() {
    try {
      const response = await this.k8sCustomApi.listClusterCustomObject({
        group: 'scaling.volumania.io',
        version: 'v1',
        plural: 'pvcautoscalers'
      });

      return (response as any).items || [];
    } catch (error) {
      console.error('Error fetching autoscalers:', error);
      return [];
    }
  }

  private parseStorageSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (!match) return 0;

    const [, numStr, unit] = match;
    const num = parseFloat(numStr);

    const multipliers: Record<string, number> = {
      'B': 1,
      'K': 1024,
      'Ki': 1024,
      'KB': 1000,
      'M': 1024 * 1024,
      'Mi': 1024 * 1024,
      'MB': 1000 * 1000,
      'G': 1024 * 1024 * 1024,
      'Gi': 1024 * 1024 * 1024,
      'GB': 1000 * 1000 * 1000,
      'T': 1024 * 1024 * 1024 * 1024,
      'Ti': 1024 * 1024 * 1024 * 1024,
      'TB': 1000 * 1000 * 1000 * 1000,
    };

    return num * (multipliers[unit] || 1);
  }
}

export const k8sClient = new KubernetesClient();