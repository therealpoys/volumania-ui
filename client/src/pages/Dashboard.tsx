import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import PVCDashboard from "@/components/PVCDashboard";
import AutoScalerForm from "@/components/AutoScalerForm";
import type { PVC, InsertAutoScaler } from "@shared/schema";

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
  },
  {
    id: "pvc-5",
    name: "elasticsearch-data",
    namespace: "logging",
    size: "200Gi",
    usedBytes: 150 * 1024 * 1024 * 1024,
    totalBytes: 200 * 1024 * 1024 * 1024,
    usagePercent: 75,
    status: "Bound",
    storageClass: "gp3",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: true,
    createdAt: "2024-01-12T11:00:00Z"
  },
  {
    id: "pvc-6",
    name: "metrics-storage",
    namespace: "monitoring",
    size: "80Gi",
    usedBytes: 10 * 1024 * 1024 * 1024,
    totalBytes: 80 * 1024 * 1024 * 1024,
    usagePercent: 12.5,
    status: "Bound",
    storageClass: "gp2",
    accessModes: ["ReadWriteOnce"],
    hasAutoscaler: false,
    createdAt: "2024-01-20T08:30:00Z"
  }
];

export default function Dashboard() {
  const [pvcs, setPvcs] = useState<PVC[]>(mockPVCs);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPvcForAutoscaler, setSelectedPvcForAutoscaler] = useState<string>("");

  const handleCreateAutoscaler = (pvcName: string) => {
    setSelectedPvcForAutoscaler(pvcName);
    setShowCreateForm(true);
  };

  const handleViewDetails = (pvcId: string) => {
    console.log('View details for PVC:', pvcId);
    // todo: remove mock functionality - implement actual details view
  };

  const handleSubmitAutoscaler = (data: InsertAutoScaler) => {
    console.log('Creating autoscaler:', data);
    
    // todo: remove mock functionality - update PVC to show it has autoscaler
    setPvcs(prev => prev.map(pvc => 
      pvc.name === data.pvcName && pvc.namespace === data.namespace
        ? { ...pvc, hasAutoscaler: true }
        : pvc
    ));
    
    setShowCreateForm(false);
    setSelectedPvcForAutoscaler("");
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setSelectedPvcForAutoscaler("");
  };

  const selectedPvc = pvcs.find(pvc => pvc.name === selectedPvcForAutoscaler);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volumania Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Kubernetes PVC autoscaling with ease
          </p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-autoscaler">
              <Plus className="h-4 w-4 mr-2" />
              Create AutoScaler
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create PVC AutoScaler</DialogTitle>
            </DialogHeader>
            <AutoScalerForm
              onSubmit={handleSubmitAutoscaler}
              onCancel={handleCancelForm}
              pvcName={selectedPvc?.name}
              namespace={selectedPvc?.namespace}
            />
          </DialogContent>
        </Dialog>
      </div>

      <PVCDashboard
        pvcs={pvcs}
        onCreateAutoscaler={handleCreateAutoscaler}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}