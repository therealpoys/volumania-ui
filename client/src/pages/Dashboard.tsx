import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PVCDashboard from "@/components/PVCDashboard";
import AutoScalerForm from "@/components/AutoScalerForm";
import type { PVC, InsertAutoScaler } from "@shared/schema";

export default function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPvcForAutoscaler, setSelectedPvcForAutoscaler] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch PVCs from API
  const { 
    data: pvcs = [], 
    isLoading: pvcsLoading, 
    error: pvcsError,
    refetch: refetchPVCs
  } = useQuery({
    queryKey: ['/api/pvcs'],
    queryFn: async () => {
      const response = await fetch('/api/pvcs');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch PVCs: ${response.status}`);
      }
      return response.json() as Promise<PVC[]>;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Create autoscaler mutation
  const createAutoScalerMutation = useMutation({
    mutationFn: async (data: InsertAutoScaler) => {
      const response = await fetch('/api/autoscalers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create autoscaler: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "AutoScaler created successfully",
        description: result.warning ? 
          "Created locally, but Kubernetes integration may be limited" :
          "AutoScaler is now active in your cluster",
      });
      
      // Refresh PVC data to show updated autoscaler status
      queryClient.invalidateQueries({ queryKey: ['/api/pvcs'] });
      
      setShowCreateForm(false);
      setSelectedPvcForAutoscaler("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create AutoScaler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateAutoscaler = (pvcName: string) => {
    setSelectedPvcForAutoscaler(pvcName);
    setShowCreateForm(true);
  };

  const handleViewDetails = (pvcId: string) => {
    console.log('View details for PVC:', pvcId);
    toast({
      title: "PVC Details",
      description: "Detailed view coming soon!",
    });
  };

  const handleSubmitAutoscaler = (data: InsertAutoScaler) => {
    createAutoScalerMutation.mutate(data);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setSelectedPvcForAutoscaler("");
  };

  const selectedPvc = pvcs.find(pvc => pvc.name === selectedPvcForAutoscaler);

  // Show error state if PVCs failed to load
  if (pvcsError) {
    return (
      <div className="space-y-6" data-testid="dashboard-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Volumania Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your Kubernetes PVC autoscaling with ease
            </p>
          </div>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failed to Connect to Kubernetes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {(pvcsError as Error).message}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Common solutions:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Ensure you have a valid kubeconfig file</li>
                <li>• Check if you're running inside a Kubernetes cluster with proper RBAC</li>
                <li>• Verify the Volumania operator is installed in your cluster</li>
              </ul>
            </div>
            <Button onClick={() => refetchPVCs()} data-testid="button-retry">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              isSubmitting={createAutoScalerMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <PVCDashboard
        pvcs={pvcs}
        onCreateAutoscaler={handleCreateAutoscaler}
        onViewDetails={handleViewDetails}
        isLoading={pvcsLoading}
      />
    </div>
  );
}