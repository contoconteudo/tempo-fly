import { AppLayout } from "@/components/layout/AppLayout";
import { BarChart3, FileText, Calendar, Eye, Download, Plus, TrendingUp, Users, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: string;
  client: string;
  period: string;
  createdAt: string;
  presented: boolean;
  presentedAt?: string;
  metrics: {
    sessions: number;
    conversions: number;
    adSpend: number;
    roas: number;
  };
  feedback?: string;
}

const reports: Report[] = [
  { id: "1", client: "Tech Solutions", period: "Janeiro 2026", createdAt: "2026-01-25", presented: true, presentedAt: "2026-01-26", metrics: { sessions: 12500, conversions: 245, adSpend: 3500, roas: 4.2 }, feedback: "Excelente resultado!" },
  { id: "2", client: "Clínica Saúde+", period: "Janeiro 2026", createdAt: "2026-01-25", presented: false, metrics: { sessions: 8200, conversions: 180, adSpend: 2800, roas: 3.8 } },
  { id: "3", client: "E-commerce Fashion", period: "Janeiro 2026", createdAt: "2026-01-24", presented: true, presentedAt: "2026-01-25", metrics: { sessions: 25000, conversions: 520, adSpend: 5500, roas: 5.5 }, feedback: "Muito satisfeitos com o ROAS" },
  { id: "4", client: "Startup Innovation", period: "Dezembro 2025", createdAt: "2025-12-28", presented: true, presentedAt: "2025-12-30", metrics: { sessions: 5600, conversions: 98, adSpend: 1500, roas: 2.8 } },
];

export default function Relatorios() {
  const pendingReports = reports.filter(r => !r.presented).length;

  return (
    <AppLayout title="Relatórios" subtitle="Analytics e BI para clientes">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Relatórios Gerados</p>
              <p className="stat-value">{reports.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pendentes</p>
              <p className="stat-value text-warning">{pendingReports}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">ROAS Médio</p>
              <p className="stat-value text-success">4.1x</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Investimento Total</p>
              <p className="stat-value">R$ 13.3k</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Relatórios Recentes</h2>
        <Button className="gradient-primary text-primary-foreground gap-1.5">
          <Plus className="h-4 w-4" />
          Gerar Relatório
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="stat-card">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">{report.client}</h3>
                <p className="text-sm text-muted-foreground">{report.period}</p>
              </div>
              <Badge className={report.presented ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                {report.presented ? "Apresentado" : "Pendente"}
              </Badge>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{(report.metrics.sessions / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessões</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{report.metrics.conversions}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversões</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">R$ {(report.metrics.adSpend / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Investido</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-success/10">
                <p className="text-lg font-bold text-success">{report.metrics.roas}x</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ROAS</p>
              </div>
            </div>

            {/* Feedback */}
            {report.feedback && (
              <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-sm text-muted-foreground italic">"{report.feedback}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-xs text-muted-foreground">
                Criado em {new Date(report.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  Visualizar
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
