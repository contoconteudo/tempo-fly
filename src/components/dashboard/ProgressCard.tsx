import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  className?: string;
}

export function ProgressCard({ title, current, target, unit = "", className }: ProgressCardProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  const getProgressColor = () => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 50) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className={cn("stat-card", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="stat-label">{title}</p>
          <span className="text-xs font-semibold text-primary">{percentage}%</span>
        </div>
        
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", getProgressColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold text-foreground">
            {unit}{current.toLocaleString('pt-BR')}
          </span>
          <span className="text-sm text-muted-foreground">
            / {unit}{target.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
}
