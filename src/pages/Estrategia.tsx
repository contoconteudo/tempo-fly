import { AppLayout } from "@/components/layout/AppLayout";
import { Target, TrendingUp, Users, Briefcase, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const objectives = [
  {
    id: "1",
    title: "Aumentar faturamento em 67%",
    description: "Crescimento de R$ 30.000 para R$ 50.000/mês",
    type: "revenue",
    icon: TrendingUp,
    progress: 72,
    deadline: "Dez 2026",
    status: "on_track",
    bimonthlyProgress: [
      { period: "Jan-Fev", target: 32000, achieved: 30500, percentage: 95 },
      { period: "Mar-Abr", target: 36000, achieved: 35000, percentage: 97 },
      { period: "Mai-Jun", target: 40000, achieved: 0, percentage: 0 },
      { period: "Jul-Ago", target: 44000, achieved: 0, percentage: 0 },
      { period: "Set-Out", target: 47000, achieved: 0, percentage: 0 },
      { period: "Nov-Dez", target: 50000, achieved: 0, percentage: 0 },
    ],
  },
  {
    id: "2",
    title: "Conquistar 5 novos clientes Premium",
    description: "Clientes com ticket médio acima de R$ 5.500",
    type: "positioning",
    icon: Target,
    progress: 60,
    deadline: "Dez 2026",
    status: "on_track",
    bimonthlyProgress: [
      { period: "Jan-Fev", target: 1, achieved: 1, percentage: 100 },
      { period: "Mar-Abr", target: 1, achieved: 1, percentage: 100 },
      { period: "Mai-Jun", target: 1, achieved: 1, percentage: 100 },
      { period: "Jul-Ago", target: 1, achieved: 0, percentage: 0 },
      { period: "Set-Out", target: 1, achieved: 0, percentage: 0 },
      { period: "Nov-Dez", target: 0, achieved: 0, percentage: 0 },
    ],
  },
  {
    id: "3",
    title: "Aumentar margem para 75%",
    description: "Otimização de processos e redução de custos",
    type: "operational",
    icon: Briefcase,
    progress: 45,
    deadline: "Dez 2026",
    status: "at_risk",
    bimonthlyProgress: [
      { period: "Jan-Fev", target: 70, achieved: 68, percentage: 97 },
      { period: "Mar-Abr", target: 71, achieved: 69, percentage: 97 },
      { period: "Mai-Jun", target: 72, achieved: 0, percentage: 0 },
      { period: "Jul-Ago", target: 73, achieved: 0, percentage: 0 },
      { period: "Set-Out", target: 74, achieved: 0, percentage: 0 },
      { period: "Nov-Dez", target: 75, achieved: 0, percentage: 0 },
    ],
  },
  {
    id: "4",
    title: "Montar equipe de 5 pessoas",
    description: "Contratação de Designer Sr e Analista de Mídia",
    type: "team",
    icon: Users,
    progress: 25,
    deadline: "Jun 2026",
    status: "behind",
    bimonthlyProgress: [
      { period: "Jan-Fev", target: 1, achieved: 0, percentage: 0 },
      { period: "Mar-Abr", target: 1, achieved: 0, percentage: 0 },
      { period: "Mai-Jun", target: 1, achieved: 0, percentage: 0 },
    ],
  },
];

const statusColors = {
  on_track: { bg: "bg-success/10", text: "text-success", bar: "bg-success" },
  at_risk: { bg: "bg-warning/10", text: "text-warning", bar: "bg-warning" },
  behind: { bg: "bg-destructive/10", text: "text-destructive", bar: "bg-destructive" },
};

const statusLabels = {
  on_track: "No prazo",
  at_risk: "Em risco",
  behind: "Atrasado",
};

export default function Estrategia() {
  return (
    <AppLayout title="Planejamento Estratégico" subtitle="OKRs e metas anuais">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Objetivos</p>
              <p className="stat-value">4</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">No Prazo</p>
              <p className="stat-value text-success">2</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Em Risco</p>
              <p className="stat-value text-warning">1</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Atrasados</p>
              <p className="stat-value text-destructive">1</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Objectives List */}
      <div className="space-y-4">
        {objectives.map((obj) => {
          const Icon = obj.icon;
          const colors = statusColors[obj.status];

          return (
            <div key={obj.id} className="stat-card group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0", colors.bg, colors.text)}>
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{obj.title}</h3>
                      <p className="text-sm text-muted-foreground">{obj.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", colors.bg, colors.text)}>
                        {statusLabels[obj.status]}
                      </span>
                      <span className="text-sm text-muted-foreground">{obj.deadline}</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
                        style={{ width: `${obj.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">{obj.progress}%</span>
                  </div>

                  {/* Bimonthly breakdown */}
                  <div className="grid grid-cols-6 gap-2">
                    {obj.bimonthlyProgress.map((bim, idx) => (
                      <div key={idx} className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">{bim.period}</p>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", bim.percentage > 0 ? colors.bar : "bg-muted")}
                            style={{ width: `${bim.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
