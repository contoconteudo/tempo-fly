import { AppLayout } from "@/components/layout/AppLayout";
import { FolderKanban, Clock, CheckCircle2, AlertTriangle, Play, Filter, Plus, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  status: "waiting" | "in_progress" | "review" | "delivered" | "canceled";
  progress: number;
  priority: "low" | "medium" | "high" | "urgent";
  startDate: string;
  dueDate: string;
  responsible: string;
  deliverables: number;
  completedDeliverables: number;
}

const projects: Project[] = [
  { id: "1", name: "Onboarding Completo", client: "Tech Solutions", type: "onboarding", status: "in_progress", progress: 65, priority: "high", startDate: "2026-01-20", dueDate: "2026-02-04", responsible: "Ana", deliverables: 5, completedDeliverables: 3 },
  { id: "2", name: "Campanha Janeiro", client: "Clínica Saúde+", type: "campaign", status: "in_progress", progress: 40, priority: "medium", startDate: "2026-01-15", dueDate: "2026-01-31", responsible: "Pedro", deliverables: 8, completedDeliverables: 3 },
  { id: "3", name: "Estratégia de Conteúdo", client: "E-commerce Fashion", type: "content", status: "review", progress: 90, priority: "medium", startDate: "2026-01-10", dueDate: "2026-01-28", responsible: "Carla", deliverables: 4, completedDeliverables: 4 },
  { id: "4", name: "Funil de Vendas", client: "Startup Innovation", type: "consulting", status: "waiting", progress: 0, priority: "low", startDate: "2026-02-01", dueDate: "2026-02-15", responsible: "Ana", deliverables: 3, completedDeliverables: 0 },
  { id: "5", name: "Redesign Site", client: "Escritório Advocacia", type: "content", status: "in_progress", progress: 25, priority: "urgent", startDate: "2026-01-22", dueDate: "2026-01-30", responsible: "Carlos", deliverables: 6, completedDeliverables: 1 },
];

const statusConfig = {
  waiting: { label: "Aguardando", icon: Clock, color: "bg-muted text-muted-foreground" },
  in_progress: { label: "Em Andamento", icon: Play, color: "bg-primary/10 text-primary" },
  review: { label: "Revisão", icon: AlertTriangle, color: "bg-warning/10 text-warning" },
  delivered: { label: "Entregue", icon: CheckCircle2, color: "bg-success/10 text-success" },
  canceled: { label: "Cancelado", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
};

const priorityConfig = {
  low: { label: "Baixa", color: "bg-muted text-muted-foreground" },
  medium: { label: "Média", color: "bg-primary/10 text-primary" },
  high: { label: "Alta", color: "bg-warning/10 text-warning" },
  urgent: { label: "Urgente", color: "bg-destructive/10 text-destructive" },
};

function getDaysRemaining(dueDate: string): { days: number; isOverdue: boolean } {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { days: Math.abs(diff), isOverdue: diff < 0 };
}

export default function Projetos() {
  const inProgress = projects.filter(p => p.status === "in_progress").length;
  const overdue = projects.filter(p => getDaysRemaining(p.dueDate).isOverdue && p.status !== "delivered").length;

  return (
    <AppLayout title="Projetos" subtitle="Gestão de projetos e entregas">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Em Andamento</p>
              <p className="stat-value">{inProgress}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Play className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Aguardando</p>
              <p className="stat-value">{projects.filter(p => p.status === "waiting").length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Atrasados</p>
              <p className="stat-value text-destructive">{overdue}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Entregues (Mês)</p>
              <p className="stat-value text-success">8</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
        <Button className="gradient-primary text-primary-foreground gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const status = statusConfig[project.status];
          const priority = priorityConfig[project.priority];
          const StatusIcon = status.icon;
          const remaining = getDaysRemaining(project.dueDate);

          return (
            <div key={project.id} className="stat-card group cursor-pointer hover:border-primary/30">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">{project.client}</p>
                </div>
                <Badge className={cn("flex-shrink-0 ml-2", priority.color)}>
                  {priority.label}
                </Badge>
              </div>

              {/* Status & Progress */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", status.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </div>
                <span className="text-xs text-muted-foreground">
                  {project.completedDeliverables}/{project.deliverables} entregas
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progresso</span>
                  <span className="text-xs font-semibold text-foreground">{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className={remaining.isOverdue ? "text-destructive font-medium" : ""}>
                    {remaining.isOverdue ? `-${remaining.days}d` : `${remaining.days}d restantes`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>{project.responsible}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
