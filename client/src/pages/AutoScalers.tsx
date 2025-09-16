import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Search, RefreshCw, Plus, Edit, Trash2, Activity, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import AutoScalerForm from "@/components/AutoScalerForm";
import type { AutoScaler, InsertAutoScaler } from "@shared/schema";

export default function AutoScalers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [namespaceFilter, setNamespaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAutoscaler, setEditingAutoscaler] = useState<AutoScaler | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: autoScalers = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/autoscalers'],
    queryFn: () => apiService.getAllAutoScalers(),
  });

  const { data: pvcs = [] } = useQuery({
    queryKey: ['/api/pvcs'],
    queryFn: () => apiService.getAllPVCs(),
  });

  // Get unique namespaces for filter
  const namespaces = Array.from(new Set(autoScalers.map(as => as.namespace)));

  // Filter AutoScalers based on search and filters
  const filteredAutoScalers = autoScalers.filter(as => {
    const matchesSearch = as.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         as.namespace.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         as.pvcName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNamespace = namespaceFilter === "all" || as.namespace === namespaceFilter;
    const matchesStatus = statusFilter === "all" || as.status === statusFilter;
    
    return matchesSearch && matchesNamespace && matchesStatus;
  });

  // Delete mutation
  const deleteAutoScalerMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteAutoScaler(id),
    onSuccess: () => {
      toast({
        title: "AutoScaler deleted",
        description: "AutoScaler has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autoscalers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pvcs'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete AutoScaler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create mutation
  const createAutoScalerMutation = useMutation({
    mutationFn: (data: InsertAutoScaler) => apiService.createAutoScaler(data),
    onSuccess: () => {
      toast({
        title: "AutoScaler created",
        description: "AutoScaler has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autoscalers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pvcs'] });
      setShowCreateForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create AutoScaler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: AutoScaler['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Inactive': return 'bg-gray-500';
      case 'Error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const handleCreateSubmit = (data: InsertAutoScaler) => {
    createAutoScalerMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    deleteAutoScalerMutation.mutate(id);
  };

  return (
    <div className="space-y-6" data-testid="page-autoscalers">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-autoscalers">
            PVC AutoScalers
          </h1>
          <p className="text-muted-foreground">
            Manage automatic scaling policies for your Persistent Volume Claims
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-autoscalers">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-autoscaler">
                <Plus className="w-4 h-4 mr-2" />
                Create AutoScaler
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create PVC AutoScaler</DialogTitle>
              </DialogHeader>
              <AutoScalerForm
                onSubmit={handleCreateSubmit}
                onCancel={() => setShowCreateForm(false)}
                availablePVCs={pvcs.filter(pvc => !pvc.hasAutoscaler)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AutoScalers</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-autoscalers">{autoScalers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-active-autoscalers">
              {autoScalers.filter(as => as.status === 'Active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Scaled</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-recently-scaled">
              {autoScalers.filter(as => as.lastScaleTime).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trigger</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-avg-trigger">
              {autoScalers.length > 0 ? 
                Math.round(autoScalers.reduce((sum, as) => sum + as.triggerAbovePercent, 0) / autoScalers.length) 
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search AutoScalers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-autoscalers"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
                <SelectTrigger data-testid="select-namespace-filter">
                  <SelectValue placeholder="All Namespaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Namespaces</SelectItem>
                  {namespaces.map(ns => (
                    <SelectItem key={ns} value={ns}>{ns}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AutoScalers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AutoScaler Overview</CardTitle>
          <CardDescription>
            Showing {filteredAutoScalers.length} of {autoScalers.length} AutoScalers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading AutoScalers...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead>PVC</TableHead>
                  <TableHead>Size Range</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Scaled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAutoScalers.map((as) => (
                  <TableRow key={as.id} data-testid={`row-autoscaler-${as.id}`}>
                    <TableCell className="font-medium" data-testid={`text-autoscaler-name-${as.id}`}>
                      {as.name}
                    </TableCell>
                    <TableCell data-testid={`text-autoscaler-namespace-${as.id}`}>
                      <Badge variant="outline">{as.namespace}</Badge>
                    </TableCell>
                    <TableCell data-testid={`text-autoscaler-pvc-${as.id}`}>{as.pvcName}</TableCell>
                    <TableCell data-testid={`text-autoscaler-range-${as.id}`}>
                      {as.minSize} - {as.maxSize}
                    </TableCell>
                    <TableCell data-testid={`text-autoscaler-trigger-${as.id}`}>
                      {as.triggerAbovePercent}%
                    </TableCell>
                    <TableCell data-testid={`text-autoscaler-interval-${as.id}`}>
                      {formatInterval(as.checkIntervalSeconds)}
                    </TableCell>
                    <TableCell data-testid={`status-autoscaler-${as.id}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(as.status)}`} />
                        {as.status}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`last-scaled-autoscaler-${as.id}`}>
                      {as.lastScaleTime ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(as.lastScaleTime).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" data-testid={`button-edit-autoscaler-${as.id}`}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" data-testid={`button-delete-autoscaler-${as.id}`}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete AutoScaler</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the AutoScaler "{as.name}"? 
                                This action cannot be undone and will disable automatic scaling for PVC "{as.pvcName}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(as.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}