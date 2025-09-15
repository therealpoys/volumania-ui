import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "Bound" | "Pending" | "Lost" | "Active" | "Inactive" | "Error";
  className?: string;
}

export default function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Bound":
      case "Active":
        return {
          color: "bg-chart-2",
          text: "text-chart-2",
          label: status
        };
      case "Pending":
        return {
          color: "bg-chart-3",
          text: "text-chart-3", 
          label: status
        };
      case "Lost":
      case "Error":
        return {
          color: "bg-chart-5",
          text: "text-chart-5",
          label: status
        };
      case "Inactive":
        return {
          color: "bg-muted-foreground",
          text: "text-muted-foreground",
          label: status
        };
      default:
        return {
          color: "bg-muted-foreground",
          text: "text-muted-foreground",
          label: "Unknown"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={cn("flex items-center gap-2", className)} data-testid={`status-${status.toLowerCase()}`}>
      <div className={cn("w-2 h-2 rounded-full", config.color)}></div>
      <span className={cn("text-sm font-medium", config.text)}>{config.label}</span>
    </div>
  );
}