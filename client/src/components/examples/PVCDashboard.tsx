import PVCDashboard from '../PVCDashboard';
import type { PVC } from '@shared/schema';

//todo: remove mock functionality
const mockPVCs: PVC[] = [
  {
    id: "pvc-1",
    name: "postgres-data",
    namespace: "production",
    size: "50Gi",
    usedBytes: 32 * 1024 * 1024 * 1024,
    totalBytes: 50 * 1024 * 1024 * 1024,
    usagePercent: 64,
    status: "Bound",
    storageClass: "gp3",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: true,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "pvc-2", 
    name: "redis-cache",
    namespace: "production",
    size: "20Gi",
    usedBytes: 18 * 1024 * 1024 * 1024,
    totalBytes: 20 * 1024 * 1024 * 1024,
    usagePercent: 90,
    status: "Bound",
    storageClass: "gp3",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: false,
    createdAt: "2024-01-10T14:20:00Z"
  },
  {
    id: "pvc-3",
    name: "app-logs",
    namespace: "staging",
    size: "100Gi",
    usedBytes: 35 * 1024 * 1024 * 1024,
    totalBytes: 100 * 1024 * 1024 * 1024,
    usagePercent: 35,
    status: "Bound",
    storageClass: "gp2",
    accessModes: ["ReadWriteMany"],
    hasAutoscaler: true,
    createdAt: "2024-01-08T09:15:00Z"
  },
  {
    id: "pvc-4",
    name: "backup-storage",
    namespace: "ops",
    size: "500Gi",
    usedBytes: 450 * 1024 * 1024 * 1024,
    totalBytes: 500 * 1024 * 1024 * 1024,
    usagePercent: 90,
    status: "Bound",
    storageClass: "cold",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: false,
    createdAt: "2024-01-05T16:45:00Z"
  }
];

export default function PVCDashboardExample() {
  return (
    <div className="p-4">
      <PVCDashboard 
        pvcs={mockPVCs}
        onCreateAutoscaler={(pvcName) => console.log('Create autoscaler for:', pvcName)}
        onViewDetails={(pvcId) => console.log('View details for:', pvcId)}
      />
    </div>
  );
}