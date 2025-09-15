import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface UsageBarProps {
  usagePercent: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function UsageBar({ 
  usagePercent, 
  size = "md", 
  showLabel = true, 
  className 
}: UsageBarProps) {
  const getColorClass = (percent: number) => {
    if (percent >= 90) return "bg-chart-5"; // Red for critical
    if (percent >= 75) return "bg-chart-3"; // Yellow for warning
    return "bg-chart-2"; // Green for normal
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm": return "h-1";
      case "lg": return "h-3";
      default: return "h-2";
    }
  };

  return (
    <div className={cn("space-y-2", className)} data-testid="usage-bar">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Usage</span>
          <span className="font-mono font-medium">{usagePercent.toFixed(1)}%</span>
        </div>
      )}
      <div className="relative">
        <Progress 
          value={usagePercent} 
          className={cn("w-full", getSizeClass(size))}
          data-testid="progress-bar"
        />
        <div 
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all",
            getColorClass(usagePercent)
          )}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        />
      </div>
    </div>
  );
}