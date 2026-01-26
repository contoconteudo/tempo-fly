import { MessageSquare, UserPlus, FileCheck, DollarSign, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "message" | "new_lead" | "delivery" | "payment" | "call";
  title: string;
  description: string;
  time: string;
  user?: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "new_lead",
    title: "Novo lead capturado",
    description: "Maria Silva via tráfego pago",
    time: "Há 5 min",
    user: "Sistema",
  },
  {
    id: "2",
    type: "delivery",
    title: "Entrega aprovada",
    description: "KV para Cliente Atalanta",
    time: "Há 15 min",
    user: "Ana",
  },
  {
    id: "3",
    type: "payment",
    title: "Pagamento confirmado",
    description: "R$ 5.500 - Tech Solutions",
    time: "Há 1h",
    user: "Sistema",
  },
  {
    id: "4",
    type: "call",
    title: "Reunião realizada",
    description: "Follow-up com StartupX",
    time: "Há 2h",
    user: "Pedro",
  },
  {
    id: "5",
    type: "message",
    title: "Feedback recebido",
    description: "NPS 9 - Agency Pro",
    time: "Há 3h",
    user: "Sistema",
  },
];

const typeConfig = {
  message: { icon: MessageSquare, color: "bg-primary/10 text-primary" },
  new_lead: { icon: UserPlus, color: "bg-success/10 text-success" },
  delivery: { icon: FileCheck, color: "bg-warning/10 text-warning" },
  payment: { icon: DollarSign, color: "bg-success/10 text-success" },
  call: { icon: Phone, color: "bg-primary/10 text-primary" },
};

export function RecentActivityCard() {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Atividade Recente</h3>
        <span className="text-xs font-medium text-muted-foreground">Hoje</span>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>

              <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
