import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PVCDashboard from "@/components/PVCDashboard";
import AutoScalerForm from "@/components/AutoScalerForm";
import { useRealTimeUpdates } from "@/hooks/useWebSocket";
import type { InsertAutoScaler } from "@shared/schema";

export default function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPvcForAutoscaler, setSelectedPvcForAutoscaler] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use real-time updates (mock or WebSocket)
  const { pvcs, connected, error: wsError, reconnect, isMockMode } = useRealTimeUpdates();
  const pvcsLoading = !connected && pvcs.length === 0;

  // Create autoscaler mutation using API service
  const createAutoScalerMutation = useMutation({
    mutationFn: async (data: InsertAutoScaler) => {
      const { apiService } = await import('@/services/apiService');
      return await apiService.createAutoScaler(data);
    },
    onSuccess: (result) => {
      toast({
        title: "AutoScaler created successfully",
        description: "AutoScaler has been created and is now active",
      });
      
      // Force reconnect to refresh real-time data
      reconnect();
      
      // Also invalidate any potential queries
      queryClient.invalidateQueries({ queryKey: ['pvcs'] });
      
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

  // Show error state if WebSocket connection failed
  if (wsError && !connected) {
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
              {wsError}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Common solutions:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Ensure you have a valid kubeconfig file</li>
                <li>• Check if you're running inside a Kubernetes cluster with proper RBAC</li>
                <li>• Verify the Volumania operator is installed in your cluster</li>
              </ul>
            </div>
            <Button onClick={reconnect} data-testid="button-retry">
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Volumania Dashboard</h1>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              connected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`} data-testid="connection-status">
              {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {connected ? (isMockMode ? 'Mock' : 'Live') : 'Offline'}
            </div>
          </div>
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