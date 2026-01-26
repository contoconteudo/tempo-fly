import { AppLayout } from "@/components/layout/AppLayout";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, AlertTriangle, CheckCircle2, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  value: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  client?: string;
}

const transactions: Transaction[] = [
  { id: "1", type: "income", category: "Cliente", description: "Mensalidade Tech Solutions", value: 5500, dueDate: "2026-01-10", paidDate: "2026-01-09", status: "paid", client: "Tech Solutions" },
  { id: "2", type: "income", category: "Cliente", description: "Mensalidade Clínica Saúde+", value: 3500, dueDate: "2026-01-10", status: "pending", client: "Clínica Saúde+" },
  { id: "3", type: "income", category: "Cliente", description: "Mensalidade E-commerce Fashion", value: 5500, dueDate: "2026-01-15", paidDate: "2026-01-14", status: "paid", client: "E-commerce Fashion" },
  { id: "4", type: "expense", category: "Ferramenta", description: "Meta Ads - Budget Clientes", value: 8500, dueDate: "2026-01-20", status: "pending" },
  { id: "5", type: "expense", category: "Salário", description: "Folha de Pagamento", value: 12000, dueDate: "2026-01-05", paidDate: "2026-01-05", status: "paid" },
  { id: "6", type: "income", category: "Cliente", description: "Mensalidade Startup Innovation", value: 3500, dueDate: "2026-01-05", status: "overdue", client: "Startup Innovation" },
];

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, color: "bg-warning/10 text-warning" },
  paid: { label: "Pago", icon: CheckCircle2, color: "bg-success/10 text-success" },
  overdue: { label: "Atrasado", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
};

export default function Financeiro() {
  const income = transactions.filter(t => t.type === "income" && t.status === "paid").reduce((sum, t) => sum + t.value, 0);
  const expenses = transactions.filter(t => t.type === "expense" && t.status === "paid").reduce((sum, t) => sum + t.value, 0);
  const pending = transactions.filter(t => t.status === "pending" && t.type === "income").reduce((sum, t) => sum + t.value, 0);
  const overdue = transactions.filter(t => t.status === "overdue").reduce((sum, t) => sum + t.value, 0);

  return (
    <AppLayout title="Financeiro" subtitle="Controle de receitas e despesas">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Receitas (Mês)</p>
              <p className="stat-value text-success">R$ {income.toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Despesas (Mês)</p>
              <p className="stat-value text-destructive">R$ {expenses.toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">A Receber</p>
              <p className="stat-value">R$ {pending.toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Inadimplência</p>
              <p className="stat-value text-destructive">R$ {overdue.toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="stat-card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo do Mês</p>
            <p className={cn("text-3xl font-bold", income - expenses > 0 ? "text-success" : "text-destructive")}>
              R$ {(income - expenses).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Margem</p>
              <p className="text-lg font-bold text-foreground">
                {income > 0 ? Math.round(((income - expenses) / income) * 100) : 0}%
              </p>
            </div>
            <Button className="gradient-primary text-primary-foreground gap-1.5">
              <Plus className="h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="stat-card overflow-hidden p-0">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Transações Recentes</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-semibold text-muted-foreground p-4">Descrição</th>
              <th className="text-left text-xs font-semibold text-muted-foreground p-4">Categoria</th>
              <th className="text-left text-xs font-semibold text-muted-foreground p-4">Vencimento</th>
              <th className="text-left text-xs font-semibold text-muted-foreground p-4">Status</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-4">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const status = statusConfig[transaction.status];
              const StatusIcon = status.icon;

              return (
                <tr key={transaction.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                      {transaction.client && (
                        <p className="text-xs text-muted-foreground">{transaction.client}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{transaction.category}</Badge>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <p className={cn("text-sm font-semibold", transaction.type === "income" ? "text-success" : "text-destructive")}>
                      {transaction.type === "income" ? "+" : "-"} R$ {transaction.value.toLocaleString('pt-BR')}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
