import { GlassCard } from "./GlassCard";
import { StatusBadge } from "./StatusBadge";
import { CoverageArc } from "./CoverageArc";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TokenCardProps {
  symbol: string;
  reserves: string;
  liabilities: string;
  coverage: number;
  status: "fully-covered" | "under-collateralized" | "pending";
  trend: "up" | "down";
}

export function TokenCard({
  symbol,
  reserves,
  liabilities,
  coverage,
  status,
  trend,
}: TokenCardProps) {
  return (
    <GlassCard className="hover-elevate active-elevate-2">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 font-mono text-lg font-bold">
            {symbol.slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold">{symbol}</h3>
            <Badge variant="outline" className="mt-1 text-xs">
              {trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-400" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-400" />
              )}
              Token
            </Badge>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mb-6 flex items-center justify-center">
        <CoverageArc percentage={coverage} />
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Verified Reserves
          </span>
          <span className="font-mono text-sm font-semibold">{reserves}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Verified Liabilities
          </span>
          <span className="font-mono text-sm font-semibold">{liabilities}</span>
        </div>
      </div>
    </GlassCard>
  );
}
