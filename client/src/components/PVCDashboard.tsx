import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, HardDrive, Settings, Activity } from "lucide-react";
import PVCCard from "./PVCCard";
import type { PVC } from "@shared/schema";

interface PVCDashboardProps {
  pvcs: PVC[];
  onCreateAutoscaler?: (pvcName: string) => void;
  onViewDetails?: (pvcId: string) => void;
  isLoading?: boolean;
}

export default function PVCDashboard({ pvcs, onCreateAutoscaler, onViewDetails, isLoading = false }: PVCDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNamespace, setSelectedNamespace] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique namespaces
  const namespaces = Array.from(new Set(pvcs.map(pvc => pvc.namespace)));

  // Filter PVCs
  const filteredPVCs = pvcs.filter(pvc => {
    const matchesSearch = pvc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pvc.namespace.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNamespace = selectedNamespace === "all" || pvc.namespace === selectedNamespace;
    const matchesStatus = statusFilter === "all" || pvc.status === statusFilter;
    
    return matchesSearch && matchesNamespace && matchesStatus;
  });

  // Dashboard stats
  const totalPVCs = pvcs.length;
  const boundPVCs = pvcs.filter(pvc => pvc.status === "Bound").length;
  const autoScaledPVCs = pvcs.filter(pvc => pvc.hasAutoscaler).length;
  const highUsagePVCs = pvcs.filter(pvc => pvc.usagePercent > 80).length;
  const avgUsage = pvcs.length > 0 ? 
    pvcs.reduce((sum, pvc) => sum + pvc.usagePercent, 0) / pvcs.length : 0;

  return (
    <div className="space-y-6" data-testid="pvc-dashboard">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PVCs</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-pvcs">{totalPVCs}</div>
            <p className="text-xs text-muted-foreground">
              {boundPVCs} bound
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-scaled</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-autoscaled">{autoScaledPVCs}</div>
            <p className="text-xs text-muted-foreground">
              {((autoScaledPVCs / totalPVCs) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-high-usage">{highUsagePVCs}</div>
            <p className="text-xs text-muted-foreground">
              Above 80% usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-avg-usage">{avgUsage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all PVCs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>PVC Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PVCs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            
            <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-namespace">
                <SelectValue placeholder="All Namespaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Namespaces</SelectItem>
                {namespaces.map(ns => (
                  <SelectItem key={ns} value={ns}>{ns}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32" data-testid="select-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Bound">Bound</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PVC Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Loading PVCs...</h3>
              <p className="text-muted-foreground">
                Fetching data from your Kubernetes cluster
              </p>
            </div>
          ) : filteredPVCs.length === 0 ? (
            <div className="text-center py-12">
              <HardDrive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No PVCs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedNamespace !== "all" || statusFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "No PVCs are currently available in your cluster"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPVCs.map((pvc) => (
                <PVCCard
                  key={pvc.id}
                  pvc={pvc}
                  onCreateAutoscaler={onCreateAutoscaler}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}