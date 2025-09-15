import PVCCard from '../PVCCard';
import type { PVC } from '@shared/schema';

//todo: remove mock functionality
const mockPVC: PVC = {
  id: "pvc-1",
  name: "postgres-data",
  namespace: "production", 
  size: "50Gi",
  usedBytes: 32 * 1024 * 1024 * 1024, // 32GB
  totalBytes: 50 * 1024 * 1024 * 1024, // 50GB
  usagePercent: 64,
  status: "Bound",
  storageClass: "gp3",
  accessModes: ["ReadWriteOnce"],
  hasAutoscaler: false,
  createdAt: "2024-01-15T10:30:00Z"
};

export default function PVCCardExample() {
  return (
    <div className="p-4 max-w-md">
      <PVCCard 
        pvc={mockPVC}
        onCreateAutoscaler={(pvcName) => console.log('Create autoscaler for:', pvcName)}
        onViewDetails={(pvcId) => console.log('View details for:', pvcId)}
      />
    </div>
  );
}