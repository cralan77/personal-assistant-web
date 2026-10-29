"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Activity,
  Dumbbell,
  Footprints,
  Moon,
  Scale,
  Wallet,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { MorningBriefingCard } from "@/components/home/MorningBriefingCard";
import { MetricQuickCard } from "@/components/home/MetricQuickCard";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  assistantService,
  healthService,
  financeService,
} from "@/lib/api/services";
import { formatCurrencyBRL } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

export default function HomePage() {
  const { user } = useAuthStore();

  // Queries
  const {
    data: briefing,
    isLoading: briefingLoading,
    refetch: refetchBriefing,
  } = useQuery({
    queryKey: ["morning-briefing"],
    queryFn: () => assistantService.getMorningBriefing(),
  });

  const { data: healthSummary } = useQuery({
    queryKey: ["health-summary"],
    queryFn: () => healthService.getSummary(),
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ["recent-workouts"],
    queryFn: () => healthService.listWorkouts(),
  });

  const { data: financeSummary } = useQuery({
    queryKey: ["finance-summary"],
    queryFn: () => financeService.getSummary(),
  });

  const recentWorkouts = workouts.slice(0, 3);
  const firstName = user?.name ? user.name.split(" ")[0] : "Bem-vindo";

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full overflow-x-hidden">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Olá, {firstName}! 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aqui está a visão consolidada da sua saúde, treinos e finanças hoje.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/body">
            <Button variant="outline" size="sm" className="h-9 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nova Avaliação
            </Button>
          </Link>
          <Link href="/finance">
            <Button variant="outline" size="sm" className="h-9 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Lançamento
            </Button>
          </Link>
          <Link href="/assistant">
            <Button
              size="sm"
              className="h-9 text-xs bg-gradient-to-r from-gemini-purple via-gemini-blue to-gemini-cyan text-white shadow-sm"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Perguntar à Aurora
            </Button>
          </Link>
        </div>
      </div>

      {/* Morning Briefing Banner */}
      <MorningBriefingCard
        briefing={briefing}
        isLoading={briefingLoading}
        onRefresh={() => refetchBriefing()}
      />

      {/* Unified Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Peso Atual */}
        <MetricQuickCard
          title="Peso Atual"
          value={
            healthSummary?.currentWeightKg
              ? `${healthSummary.currentWeightKg} kg`
              : "-- kg"
          }
          subtitle={`Meta: ${healthSummary?.targetWeightKg || 75} kg`}
          icon={Scale}
          iconColor="text-health-primary"
          iconBg="bg-health-primary/10"
        />

        {/* % de Gordura */}
        <MetricQuickCard
          title="% Gordura"
          value={
            healthSummary?.bodyFatPercentage
              ? `${healthSummary.bodyFatPercentage}%`
              : "--%"
          }
          subtitle={healthSummary?.bmiCategory || "Aguardando medição"}
          icon={Activity}
          iconColor="text-secondary"
          iconBg="bg-secondary/10"
        />

        {/* Passos */}
        <MetricQuickCard
          title="Passos Hoje"
          value={
            healthSummary?.todaySteps != null
              ? healthSummary.todaySteps.toLocaleString("pt-BR")
              : "0"
          }
          subtitle="Meta: 10.000"
          icon={Footprints}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />

        {/* Sono */}
        <MetricQuickCard
          title="Sono da Noite"
          value={
            healthSummary?.lastNightSleepMinutes
              ? `${Math.floor(healthSummary.lastNightSleepMinutes / 60)}h ${
                  healthSummary.lastNightSleepMinutes % 60
                }m`
              : "--"
          }
          subtitle={healthSummary?.lastNightSleepMinutes ? "Qualidade registrada" : "Sem registro recente"}
          icon={Moon}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-500/10"
        />

        {/* Saldo Financeiro */}
        <MetricQuickCard
          title="Saldo Líquido"
          value={formatCurrencyBRL(financeSummary?.totalBalance ?? 0)}
          subtitle="No mês corrente"
          icon={Wallet}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-500/10"
        />

        {/* Contas a Vencer */}
        <MetricQuickCard
          title="A Pagar"
          value={formatCurrencyBRL(financeSummary?.pendingBillsAmount ?? 0)}
          subtitle={`${financeSummary?.pendingBillsCount ?? 0} pendências`}
          icon={AlertCircle}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Main Content 2 Columns: Recent Workouts & Financial Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Recent Workouts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5 text-health-primary" />
              <h3 className="text-lg font-bold text-foreground">
                Últimos Treinos & Telemetria
              </h3>
            </div>
            <Link
              href="/workouts"
              className="flex items-center text-xs font-semibold text-health-primary hover:underline"
            >
              Ver todos ({workouts.length})
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentWorkouts.length === 0 ? (
              <Card className="border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum treino sincronizado ainda. Realize seus treinos com o app ou Health Connect.
                </p>
              </Card>
            ) : (
              recentWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))
            )}
          </div>
        </div>

        {/* Right Col: Quick Assistant & Highlights */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm overflow-hidden bg-gradient-to-br from-card to-gemini-purple/5">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-gemini-purple" />
                <CardTitle className="text-base font-semibold">
                  Assistente Rápido
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tire dúvidas instantâneas sobre seus gráficos de zonas cardíacas,
                carga TRIMP ou planejamento de despesas.
              </p>
              <div className="space-y-2">
                <Link
                  href="/assistant"
                  className="block w-full rounded-xl border border-border bg-card p-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-health-primary/40 transition-all text-left"
                >
                  💬 &quot;Quanto gastei em saúde e suplementos este mês?&quot;
                </Link>
                <Link
                  href="/assistant"
                  className="block w-full rounded-xl border border-border bg-card p-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-health-primary/40 transition-all text-left"
                >
                  🏃 &quot;Qual o tempo recomendado de recuperação do meu último treino?&quot;
                </Link>
              </div>
              <Link href="/assistant" className="block pt-2">
                <Button className="w-full bg-gradient-to-r from-gemini-purple to-gemini-blue text-white text-xs h-9">
                  Abrir Chat da Aurora
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
