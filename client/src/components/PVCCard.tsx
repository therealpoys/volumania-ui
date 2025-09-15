import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardDrive, Settings, Plus } from "lucide-react";
import StatusIndicator from "./StatusIndicator";
import UsageBar from "./UsageBar";
import type { PVC } from "@shared/schema";

interface PVCCardProps {
  pvc: PVC;
  onCreateAutoscaler?: (pvcName: string) => void;
  onViewDetails?: (pvcId: string) => void;
}

export default function PVCCard({ pvc, onCreateAutoscaler, onViewDetails }: PVCCardProps) {
  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Card className="hover-elevate" data-testid={`pvc-card-${pvc.id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold">{pvc.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{pvc.namespace}</p>
          </div>
        </div>
        <StatusIndicator status={pvc.status} />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Size</span>
          <span className="font-mono text-sm font-medium">{pvc.size}</span>
        </div>
        
        <UsageBar usagePercent={pvc.usagePercent} />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Used: {formatBytes(pvc.usedBytes)}</span>
          <span>Total: {formatBytes(pvc.totalBytes)}</span>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {pvc.hasAutoscaler ? (
              <Badge variant="secondary" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Auto-scaled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Manual</Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewDetails?.(pvc.id)}
              data-testid={`button-view-details-${pvc.id}`}
            >
              Details
            </Button>
            {!pvc.hasAutoscaler && (
              <Button 
                size="sm"
                onClick={() => onCreateAutoscaler?.(pvc.name)}
                data-testid={`button-create-autoscaler-${pvc.id}`}
              >
                <Plus className="h-3 w-3 mr-1" />
                Autoscale
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}