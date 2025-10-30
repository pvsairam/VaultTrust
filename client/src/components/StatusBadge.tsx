import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "fully-covered" | "under-collateralized" | "pending";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  "fully-covered": {
    label: "Fully Covered",
    icon: CheckCircle2,
    className: "bg-green-500/20 text-green-300 border-green-500/30",
  },
  "under-collateralized": {
    label: "Under-collateralized",
    icon: AlertTriangle,
    className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 px-3 py-1 text-xs font-semibold",
        config.className,
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
