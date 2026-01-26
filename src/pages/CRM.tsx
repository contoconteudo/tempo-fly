import { AppLayout } from "@/components/layout/AppLayout";
import { Flame, Thermometer, Snowflake, Plus, Phone, Mail, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  value: number;
  temperature: "hot" | "warm" | "cold";
  origin: string;
  lastContact: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
}

const pipelineData: Stage[] = [
  {
    id: "new",
    name: "Novo",
    color: "bg-muted-foreground",
    leads: [
      { id: "1", name: "Maria Silva", company: "Tech Startup", email: "maria@tech.com", value: 3500, temperature: "hot", origin: "Tráfego Pago", lastContact: "Hoje" },
      { id: "2", name: "Pedro Costa", company: "E-commerce X", email: "pedro@ecomm.com", value: 2800, temperature: "warm", origin: "Indicação", lastContact: "Ontem" },
      { id: "3", name: "Carla Mendes", company: "Clínica Saúde", email: "carla@clinica.com", value: 5500, temperature: "hot", origin: "Orgânico", lastContact: "Hoje" },
    ],
  },
  {
    id: "contact",
    name: "Contato Realizado",
    color: "bg-primary",
    leads: [
      { id: "4", name: "João Santos", company: "Corp Inc", email: "joao@corp.com", value: 4500, temperature: "warm", origin: "LinkedIn", lastContact: "2 dias" },
      { id: "5", name: "Ana Lima", company: "Agency Pro", email: "ana@agency.com", value: 5500, temperature: "hot", origin: "Evento", lastContact: "Hoje" },
    ],
  },
  {
    id: "proposal",
    name: "Proposta Enviada",
    color: "bg-warning",
    leads: [
      { id: "6", name: "Roberto Alves", company: "Startup Y", email: "roberto@startup.com", value: 5500, temperature: "hot", origin: "Outbound", lastContact: "3 dias" },
    ],
  },
  {
    id: "negotiation",
    name: "Negociação",
    color: "bg-success",
    leads: [
      { id: "7", name: "Fernanda Dias", company: "Loja Virtual", email: "fernanda@loja.com", value: 3000, temperature: "cold", origin: "Indicação", lastContact: "1 semana" },
    ],
  },
  {
    id: "won",
    name: "Ganho",
    color: "bg-success",
    leads: [
      { id: "8", name: "Lucas Pereira", company: "Tech Solutions", email: "lucas@tech.com", value: 5500, temperature: "hot", origin: "Tráfego Pago", lastContact: "Ontem" },
    ],
  },
];

const TemperatureIcon = ({ temp }: { temp: "hot" | "warm" | "cold" }) => {
  const config = {
    hot: { icon: Flame, class: "text-destructive" },
    warm: { icon: Thermometer, class: "text-warning" },
    cold: { icon: Snowflake, class: "text-primary" },
  };
  const { icon: Icon, class: className } = config[temp];
  return <Icon className={cn("h-3.5 w-3.5", className)} />;
};

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-card rounded-lg p-3 border border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
          <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
        </div>
        <TemperatureIcon temp={lead.temperature} />
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground">
          {lead.origin}
        </span>
        <span className="text-[10px] text-muted-foreground">• {lead.lastContact}</span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-primary">
          R$ {lead.value.toLocaleString('pt-BR')}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded hover:bg-muted transition-colors">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded hover:bg-muted transition-colors">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded hover:bg-muted transition-colors">
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CRM() {
  const totalPipeline = pipelineData.reduce(
    (acc, stage) => acc + stage.leads.reduce((sum, lead) => sum + lead.value, 0),
    0
  );

  return (
    <AppLayout title="CRM" subtitle="Pipeline de vendas">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Total no Pipeline</p>
            <p className="text-2xl font-bold text-foreground">R$ {totalPipeline.toLocaleString('pt-BR')}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">Leads Ativos</p>
            <p className="text-2xl font-bold text-foreground">
              {pipelineData.reduce((acc, stage) => acc + stage.leads.length, 0)}
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">Taxa Conversão</p>
            <p className="text-2xl font-bold text-success">23%</p>
          </div>
        </div>
        <Button className="gradient-primary text-primary-foreground gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineData.map((stage) => {
          const stageTotal = stage.leads.reduce((sum, lead) => sum + lead.value, 0);
          
          return (
            <div key={stage.id} className="flex-shrink-0 w-72">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", stage.color)} />
                  <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {stage.leads.length}
                  </span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  R$ {(stageTotal / 1000).toFixed(1)}k
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[200px] p-2 rounded-lg bg-muted/30">
                {stage.leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                <button className="w-full p-2 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
