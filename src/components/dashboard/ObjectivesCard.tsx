import { Target, TrendingUp, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface Objective {
  id: string;
  title: string;
  type: "revenue" | "positioning" | "operational" | "team";
  progress: number;
  target: string;
  current: string;
  status: "on_track" | "at_risk" | "behind";
}

const mockObjectives: Objective[] = [
  {
    id: "1",
    title: "Aumentar faturamento em 67%",
    type: "revenue",
    progress: 72,
    target: "R$ 50.000",
    current: "R$ 36.000",
    status: "on_track",
  },
  {
    id: "2",
    title: "Conquistar 5 novos clientes",
    type: "positioning",
    progress: 60,
    target: "5 clientes",
    current: "3 clientes",
    status: "on_track",
  },
  {
    id: "3",
    title: "Aumentar margem para 75%",
    type: "operational",
    progress: 45,
    target: "75%",
    current: "68%",
    status: "at_risk",
  },
  {
    id: "4",
    title: "Contratar Designer Sr",
    type: "team",
    progress: 25,
    target: "1 contratação",
    current: "Em processo",
    status: "behind",
  },
];

const typeIcons = {
  revenue: TrendingUp,
  positioning: Target,
  operational: Briefcase,
  team: Users,
};

const statusColors = {
  on_track: "bg-success",
  at_risk: "bg-warning",
  behind: "bg-destructive",
};

export function ObjectivesCard() {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Objetivos Estratégicos</h3>
        <span className="text-xs font-medium text-muted-foreground">Q1 2026</span>
      </div>

      <div className="space-y-4">
        {mockObjectives.map((objective) => {
          const Icon = typeIcons[objective.type];

          return (
            <div key={objective.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{objective.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{objective.current}</span>
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className="text-xs font-medium text-foreground">{objective.target}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{objective.progress}%</span>
              </div>
              
              <div className="ml-11 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", statusColors[objective.status])}
                  style={{ width: `${objective.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
        Ver planejamento completo →
      </button>
    </div>
  );
}
