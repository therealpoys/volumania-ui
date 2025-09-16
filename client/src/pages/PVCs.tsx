import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Search, Filter, RefreshCw, Plus } from "lucide-react";
import { apiService } from "@/services/apiService";
import type { PVC } from "@shared/schema";

export default function PVCs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [namespaceFilter, setNamespaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: pvcs = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/pvcs'],
    queryFn: () => apiService.getAllPVCs(),
  });

  // Get unique namespaces for filter
  const namespaces = Array.from(new Set(pvcs.map(pvc => pvc.namespace)));

  // Filter PVCs based on search and filters
  const filteredPVCs = pvcs.filter(pvc => {
    const matchesSearch = pvc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pvc.namespace.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNamespace = namespaceFilter === "all" || pvc.namespace === namespaceFilter;
    const matchesStatus = statusFilter === "all" || pvc.status === statusFilter;
    
    return matchesSearch && matchesNamespace && matchesStatus;
  });

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: PVC['status']) => {
    switch (status) {
      case 'Bound': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6" data-testid="page-pvcs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-pvcs">
            Persistent Volume Claims
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your Kubernetes storage volumes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-pvcs">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button data-testid="button-create-pvc">
            <Plus className="w-4 h-4 mr-2" />
            Create PVC
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PVCs</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-pvcs">{pvcs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bound</CardTitle>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-bound-pvcs">
              {pvcs.filter(pvc => pvc.status === 'Bound').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With AutoScaler</CardTitle>
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-autoscaled-pvcs">
              {pvcs.filter(pvc => pvc.hasAutoscaler).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
            <div className="w-2 h-2 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-avg-usage">
              {pvcs.length > 0 ? Math.round(pvcs.reduce((sum, pvc) => sum + pvc.usagePercent, 0) / pvcs.length) : 0}%
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
                  placeholder="Search PVCs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-pvcs"
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
                  <SelectItem value="Bound">Bound</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PVCs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">PVC Overview</CardTitle>
          <CardDescription>
            Showing {filteredPVCs.length} of {pvcs.length} PVCs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading PVCs...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Storage Class</TableHead>
                  <TableHead>AutoScaler</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPVCs.map((pvc) => (
                  <TableRow key={pvc.id} data-testid={`row-pvc-${pvc.id}`}>
                    <TableCell className="font-medium" data-testid={`text-pvc-name-${pvc.id}`}>
                      {pvc.name}
                    </TableCell>
                    <TableCell data-testid={`text-pvc-namespace-${pvc.id}`}>
                      <Badge variant="outline">{pvc.namespace}</Badge>
                    </TableCell>
                    <TableCell data-testid={`text-pvc-size-${pvc.id}`}>{pvc.size}</TableCell>
                    <TableCell data-testid={`usage-pvc-${pvc.id}`}>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{formatBytes(pvc.usedBytes)}</span>
                          <span>{pvc.usagePercent}%</span>
                        </div>
                        <Progress value={pvc.usagePercent} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell data-testid={`status-pvc-${pvc.id}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(pvc.status)}`} />
                        {pvc.status}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`storage-class-pvc-${pvc.id}`}>{pvc.storageClass}</TableCell>
                    <TableCell data-testid={`autoscaler-pvc-${pvc.id}`}>
                      {pvc.hasAutoscaler ? (
                        <Badge className="bg-blue-500">Enabled</Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" data-testid={`button-view-pvc-${pvc.id}`}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-edit-pvc-${pvc.id}`}>
                          Edit
                        </Button>
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