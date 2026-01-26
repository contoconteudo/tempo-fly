import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { PipelineCard } from "@/components/dashboard/PipelineCard";
import { DeliveriesCard } from "@/components/dashboard/DeliveriesCard";
import { ObjectivesCard } from "@/components/dashboard/ObjectivesCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import {
  DollarSign,
  Users,
  FolderKanban,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da operação">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Faturamento Mensal"
          value="R$ 35.000"
          trend={{ value: "+12% vs mês anterior", isPositive: true }}
          icon={<DollarSign className="h-5 w-5" />}
          iconClassName="gradient-primary text-primary-foreground"
        />
        <StatCard
          title="Novos Clientes"
          value="3"
          trend={{ value: "+2 este mês", isPositive: true }}
          icon={<Users className="h-5 w-5" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Projetos Ativos"
          value="12"
          trend={{ value: "2 atrasados", isPositive: false }}
          icon={<FolderKanban className="h-5 w-5" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Taxa Conversão"
          value="23%"
          trend={{ value: "-5% vs média", isPositive: false }}
          icon={<TrendingUp className="h-5 w-5" />}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      {/* Meta Bimestral + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ProgressCard
          title="Meta Bimestral"
          current={25000}
          target={35000}
          unit="R$ "
          className="lg:col-span-1"
        />
        <div className="lg:col-span-2">
          <PipelineCard />
        </div>
      </div>

      {/* Objectives + Deliveries + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ObjectivesCard />
        <DeliveriesCard />
        <RecentActivityCard />
      </div>
    </AppLayout>
  );
}
