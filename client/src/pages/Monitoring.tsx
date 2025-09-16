import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { BarChart3, TrendingUp, Activity, AlertTriangle, RefreshCw, Database, Clock, Zap } from "lucide-react";
import { apiService } from "@/services/apiService";
import type { PVC, AutoScaler } from "@shared/schema";

export default function Monitoring() {
  const [timeRange, setTimeRange] = useState("24h");
  const [namespaceFilter, setNamespaceFilter] = useState("all");

  const { data: pvcs = [], isLoading: pvcsLoading, refetch: refetchPVCs } = useQuery({
    queryKey: ['/api/pvcs'],
    queryFn: () => apiService.getAllPVCs(),
  });

  const { data: autoScalers = [], isLoading: autoScalersLoading, refetch: refetchAutoScalers } = useQuery({
    queryKey: ['/api/autoscalers'],
    queryFn: () => apiService.getAllAutoScalers(),
  });

  // Get unique namespaces for filter
  const namespaces = Array.from(new Set(pvcs.map(pvc => pvc.namespace)));

  // Filter data based on namespace
  const filteredPVCs = namespaceFilter === "all" ? pvcs : pvcs.filter(pvc => pvc.namespace === namespaceFilter);
  const filteredAutoScalers = namespaceFilter === "all" ? autoScalers : autoScalers.filter(as => as.namespace === namespaceFilter);

  // Calculate metrics
  const totalStorage = filteredPVCs.reduce((sum, pvc) => sum + pvc.totalBytes, 0);
  const usedStorage = filteredPVCs.reduce((sum, pvc) => sum + pvc.usedBytes, 0);
  const avgUsage = filteredPVCs.length > 0 ? filteredPVCs.reduce((sum, pvc) => sum + pvc.usagePercent, 0) / filteredPVCs.length : 0;
  const criticalPVCs = filteredPVCs.filter(pvc => pvc.usagePercent > 80).length;

  // Mock time-series data for charts
  const generateTimeSeriesData = () => {
    const hours = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
    const interval = timeRange === "24h" ? 1 : timeRange === "7d" ? 6 : 24;
    
    return Array.from({ length: Math.floor(hours / interval) }, (_, i) => {
      const time = new Date();
      time.setHours(time.getHours() - (hours - i * interval));
      
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        usage: Math.random() * 30 + 50, // Random usage between 50-80%
        iops: Math.random() * 1000 + 500, // Random IOPS
        throughput: Math.random() * 100 + 50, // Random throughput MB/s
      };
    });
  };

  const timeSeriesData = generateTimeSeriesData();

  // Prepare chart data
  const usageByNamespace = namespaces.map(ns => {
    const nsPVCs = pvcs.filter(pvc => pvc.namespace === ns);
    const avgUsage = nsPVCs.length > 0 ? nsPVCs.reduce((sum, pvc) => sum + pvc.usagePercent, 0) / nsPVCs.length : 0;
    return {
      namespace: ns,
      usage: Math.round(avgUsage),
      count: nsPVCs.length
    };
  });

  const storageDistribution = namespaces.map(ns => {
    const nsPVCs = pvcs.filter(pvc => pvc.namespace === ns);
    const totalBytes = nsPVCs.reduce((sum, pvc) => sum + pvc.totalBytes, 0);
    return {
      name: ns,
      value: totalBytes,
      count: nsPVCs.length
    };
  });

  const statusDistribution = [
    { name: 'Bound', value: pvcs.filter(pvc => pvc.status === 'Bound').length, color: '#10b981' },
    { name: 'Pending', value: pvcs.filter(pvc => pvc.status === 'Pending').length, color: '#f59e0b' },
    { name: 'Lost', value: pvcs.filter(pvc => pvc.status === 'Lost').length, color: '#ef4444' }
  ];

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isLoading = pvcsLoading || autoScalersLoading;

  return (
    <div className="space-y-6" data-testid="page-monitoring">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-monitoring">
            Storage Monitoring
          </h1>
          <p className="text-muted-foreground">
            Monitor storage usage, performance metrics, and AutoScaler activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
            <SelectTrigger className="w-48" data-testid="select-namespace-filter">
              <SelectValue placeholder="All Namespaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Namespaces</SelectItem>
              {namespaces.map(ns => (
                <SelectItem key={ns} value={ns}>{ns}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { refetchPVCs(); refetchAutoScalers(); }} data-testid="button-refresh-monitoring">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-storage">
              {formatBytes(totalStorage)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(usedStorage)} used
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-avg-usage">
              {Math.round(avgUsage)}%
            </div>
            <Progress value={avgUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active AutoScalers</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="metric-active-autoscalers">
              {filteredAutoScalers.filter(as => as.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {filteredAutoScalers.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical PVCs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="metric-critical-pvcs">
              {criticalPVCs}
            </div>
            <p className="text-xs text-muted-foreground">
              above 80% usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Storage Usage Trend
            </CardTitle>
            <CardDescription>Storage usage over time ({timeRange})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="usage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>IOPS and throughput over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="iops" stroke="#10b981" name="IOPS" />
                  <Line type="monotone" dataKey="throughput" stroke="#f59e0b" name="Throughput (MB/s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage by Namespace</CardTitle>
            <CardDescription>Average storage usage per namespace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageByNamespace}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="namespace" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Storage Distribution</CardTitle>
            <CardDescription>Storage allocation by namespace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {storageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatBytes(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">PVC Status Distribution</CardTitle>
            <CardDescription>Current status of all PVCs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent AutoScaler Activity
          </CardTitle>
          <CardDescription>Latest scaling events and AutoScaler status changes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading activity...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAutoScalers
                .filter(as => as.lastScaleTime)
                .slice(0, 5)
                .map((as, index) => (
                  <div key={as.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`activity-item-${index}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${as.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <div>
                        <p className="font-medium">{as.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Scaled PVC "{as.pvcName}" in namespace "{as.namespace}"
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={as.status === 'Active' ? 'default' : 'secondary'}>
                        {as.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {as.lastScaleTime ? new Date(as.lastScaleTime).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                ))}
              {filteredAutoScalers.filter(as => as.lastScaleTime).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recent scaling activity
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}