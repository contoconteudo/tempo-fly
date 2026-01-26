import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Delivery {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  status: "overdue" | "today" | "upcoming" | "completed";
  daysOverdue?: number;
}

const mockDeliveries: Delivery[] = [
  { id: "1", title: "KV + 10 posts", client: "Cliente Atalanta", dueDate: "2026-01-24", status: "overdue", daysOverdue: 2 },
  { id: "2", title: "Relatório Mensal", client: "Tech Solutions", dueDate: "2026-01-25", status: "overdue", daysOverdue: 1 },
  { id: "3", title: "Estratégia de Funil", client: "StartupX", dueDate: "2026-01-26", status: "today" },
  { id: "4", title: "Landing Page", client: "Corp Inc", dueDate: "2026-01-28", status: "upcoming" },
  { id: "5", title: "Campanha Meta", client: "Agency Pro", dueDate: "2026-01-30", status: "upcoming" },
];

const statusConfig = {
  overdue: {
    icon: AlertTriangle,
    iconClass: "text-destructive",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    label: "Atrasado",
  },
  today: {
    icon: Clock,
    iconClass: "text-warning",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    label: "Hoje",
  },
  upcoming: {
    icon: Clock,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
    label: "Em breve",
  },
  completed: {
    icon: CheckCircle2,
    iconClass: "text-success",
    badgeClass: "bg-success/10 text-success border-success/20",
    label: "Concluído",
  },
};

export function DeliveriesCard() {
  const overdueCount = mockDeliveries.filter(d => d.status === "overdue").length;

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Próximas Entregas</h3>
        {overdueCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {mockDeliveries.slice(0, 5).map((delivery) => {
          const config = statusConfig[delivery.status];
          const Icon = config.icon;

          return (
            <div
              key={delivery.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                delivery.status === "overdue" ? "bg-destructive/5" : "hover:bg-muted/50"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", config.iconClass)} />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{delivery.title}</p>
                <p className="text-xs text-muted-foreground">{delivery.client}</p>
              </div>

              <div className="text-right flex-shrink-0">
                {delivery.status === "overdue" && delivery.daysOverdue && (
                  <span className="text-xs font-medium text-destructive">
                    -{delivery.daysOverdue}d
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(delivery.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
        Ver todas as entregas →
      </button>
    </div>
  );
}
