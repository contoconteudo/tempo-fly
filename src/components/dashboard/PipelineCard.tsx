import { Flame, Thermometer, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  temperature: "hot" | "warm" | "cold";
}

interface PipelineStage {
  name: string;
  leads: Lead[];
  totalValue: number;
}

const mockPipeline: PipelineStage[] = [
  {
    name: "Novo",
    leads: [
      { id: "1", name: "Maria Silva", company: "Tech Co", value: 3500, temperature: "hot" },
      { id: "2", name: "Pedro Costa", company: "StartupX", value: 2800, temperature: "warm" },
    ],
    totalValue: 6300,
  },
  {
    name: "Contato",
    leads: [
      { id: "3", name: "João Santos", company: "Corp Inc", value: 4500, temperature: "warm" },
      { id: "4", name: "Ana Lima", company: "Agency Pro", value: 5500, temperature: "hot" },
    ],
    totalValue: 10000,
  },
  {
    name: "Proposta",
    leads: [
      { id: "5", name: "Empresa X", company: "Empresa X", value: 5500, temperature: "hot" },
    ],
    totalValue: 5500,
  },
  {
    name: "Negociação",
    leads: [
      { id: "6", name: "Startup Y", company: "Startup Y", value: 3000, temperature: "cold" },
    ],
    totalValue: 3000,
  },
];

const TemperatureIcon = ({ temp }: { temp: "hot" | "warm" | "cold" }) => {
  const icons = {
    hot: <Flame className="h-3 w-3 text-destructive" />,
    warm: <Thermometer className="h-3 w-3 text-warning" />,
    cold: <Snowflake className="h-3 w-3 text-primary" />,
  };
  return icons[temp];
};

export function PipelineCard() {
  const totalPipeline = mockPipeline.reduce((acc, stage) => acc + stage.totalValue, 0);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Pipeline Comercial</h3>
        <span className="text-sm font-semibold text-primary">
          R$ {totalPipeline.toLocaleString('pt-BR')}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {mockPipeline.map((stage) => (
          <div key={stage.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{stage.name}</span>
              <span className="text-xs font-semibold text-foreground">
                R$ {(stage.totalValue / 1000).toFixed(1)}k
              </span>
            </div>
            
            <div className="space-y-2">
              {stage.leads.map((lead) => (
                <div
                  key={lead.id}
                  className="pipeline-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                    </div>
                    <TemperatureIcon temp={lead.temperature} />
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-primary">
                    R$ {lead.value.toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
