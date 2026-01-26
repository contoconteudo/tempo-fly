import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: ReactNode;
  iconClassName?: string;
}

export function StatCard({ title, value, trend, icon, iconClassName }: StatCardProps) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          {trend && (
            <div className={cn(trend.isPositive ? "stat-trend-up" : "stat-trend-down")}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
          iconClassName || "bg-primary/10 text-primary"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
