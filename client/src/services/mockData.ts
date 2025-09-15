import type { PVC, AutoScaler } from "@shared/schema";

// Mock PVC data for development/testing
export const mockPVCs: PVC[] = [
  {
    id: "production/postgres-data",
    name: "postgres-data",
    namespace: "production",
    size: "50Gi",
    usedBytes: 32 * 1024 * 1024 * 1024, // 32GB
    totalBytes: 50 * 1024 * 1024 * 1024, // 50GB
    usagePercent: 64,
    status: "Bound",
    storageClass: "gp3",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: true,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "production/redis-cache",
    name: "redis-cache", 
    namespace: "production",
    size: "20Gi",
    usedBytes: 18 * 1024 * 1024 * 1024, // 18GB
    totalBytes: 20 * 1024 * 1024 * 1024, // 20GB
    usagePercent: 90,
    status: "Bound",
    storageClass: "gp3",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: false,
    createdAt: "2024-01-10T14:20:00Z"
  },
  {
    id: "staging/app-logs",
    name: "app-logs",
    namespace: "staging", 
    size: "100Gi",
    usedBytes: 35 * 1024 * 1024 * 1024, // 35GB
    totalBytes: 100 * 1024 * 1024 * 1024, // 100GB
    usagePercent: 35,
    status: "Bound",
    storageClass: "gp2",
    accessModes: ["ReadWriteMany"],
    hasAutoscaler: true,
    createdAt: "2024-01-08T09:15:00Z"
  },
  {
    id: "ops/backup-storage",
    name: "backup-storage",
    namespace: "ops",
    size: "500Gi", 
    usedBytes: 450 * 1024 * 1024 * 1024, // 450GB
    totalBytes: 500 * 1024 * 1024 * 1024, // 500GB
    usagePercent: 90,
    status: "Bound",
    storageClass: "cold",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: false,
    createdAt: "2024-01-05T16:45:00Z"
  },
  {
    id: "logging/elasticsearch-data",
    name: "elasticsearch-data",
    namespace: "logging",
    size: "200Gi",
    usedBytes: 150 * 1024 * 1024 * 1024, // 150GB  
    totalBytes: 200 * 1024 * 1024 * 1024, // 200GB
    usagePercent: 75,
    status: "Bound",
    storageClass: "gp3",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: true,
    createdAt: "2024-01-12T11:00:00Z"
  },
  {
    id: "monitoring/metrics-storage",
    name: "metrics-storage",
    namespace: "monitoring",
    size: "80Gi",
    usedBytes: 10 * 1024 * 1024 * 1024, // 10GB
    totalBytes: 80 * 1024 * 1024 * 1024, // 80GB
    usagePercent: 12.5,
    status: "Bound",
    storageClass: "gp2",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: false,
    createdAt: "2024-01-20T08:30:00Z"
  }
];

// Mock AutoScaler data
export const mockAutoScalers: AutoScaler[] = [
  {
    id: "as-1",
    name: "postgres-autoscaler",
    namespace: "production",
    pvcName: "postgres-data",
    minSize: "20Gi",
    maxSize: "500Gi", 
    stepSize: "10Gi",
    triggerAbovePercent: 80,
    checkIntervalSeconds: 300,
    cooldownSeconds: 900,
    status: "Active",
    lastScaleTime: "2024-01-20T12:30:00Z",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "as-2",
    name: "logs-autoscaler",
    namespace: "staging",
    pvcName: "app-logs",
    minSize: "50Gi",
    maxSize: "1Ti",
    stepSize: "50Gi", 
    triggerAbovePercent: 85,
    checkIntervalSeconds: 600,
    cooldownSeconds: 1800,
    status: "Active",
    lastScaleTime: undefined,
    createdAt: "2024-01-08T09:15:00Z"
  },
  {
    id: "as-3",
    name: "elasticsearch-autoscaler",
    namespace: "logging",
    pvcName: "elasticsearch-data",
    minSize: "100Gi",
    maxSize: "2Ti",
    stepSize: "100Gi",
    triggerAbovePercent: 75,
    checkIntervalSeconds: 300,
    cooldownSeconds: 1200,
    status: "Active", 
    lastScaleTime: "2024-01-19T08:45:00Z",
    createdAt: "2024-01-12T11:00:00Z"
  }
];