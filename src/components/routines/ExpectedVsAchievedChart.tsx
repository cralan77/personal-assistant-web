"use client";

import { RoutineAnalyticsComparison } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Trophy,
  CheckCircle2,
  Sparkles,
  PauseCircle,
} from "lucide-react";

interface ExpectedVsAchievedChartProps {
  data?: RoutineAnalyticsComparison;
  isLoading?: boolean;
}

const SCHEDULE_LABELS: Record<string, string> = {
  DAILY: "Diário",
  FIXED_WEEKLY: "Semanal Fixo",
  FLEXIBLE_WEEKLY: "Semanal Flexível",
  FIXED_MONTHLY: "Mensal Fixo",
  FLEXIBLE_MONTHLY: "Mensal Flexível",
};

const MODE_LABELS: Record<string, string> = {
  CHECK: "Check",
  QUANTITATIVE: "Quantitativo",
  TODO_LINKED: "Vínculo To-Do",
  HEALTH_AUTO: "Auto Saúde",
};

export function ExpectedVsAchievedChart({
  data,
  isLoading,
}: ExpectedVsAchievedChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Carregando comparativo Esperado vs. Alcançado...
        </CardContent>
      </Card>
    );
  }

  const metrics = data?.overallMetrics || {
    totalExpected: 0,
    totalAchievedCapped: 0,
    totalAchievedRaw: 0,
    totalSkipped: 0,
    consistencyPercentage: 0,
    overachievementCount: 0,
  };

  const series = data?.barChartSeries || [];
  const breakdown = data?.habitBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Top KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Taxa Geral (Com Cap 100%)
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-health-primary">
                {metrics.consistencyPercentage.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {metrics.totalAchievedCapped} / {metrics.totalExpected} metas batidas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Total Esperado no Ciclo
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {metrics.totalExpected}
              </span>
              <span className="text-xs text-muted-foreground">execuções</span>
            </div>
            {metrics.totalSkipped > 0 && (
              <p className="text-[11px] text-amber-500 mt-1 flex items-center gap-1">
                <PauseCircle className="h-3 w-3" />
                {metrics.totalSkipped} abonada(s) por skip
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Total Alcançado Bruto
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-500">
                {metrics.totalAchievedRaw}
              </span>
              <span className="text-xs text-muted-foreground">realizadas</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Inclui bônus e superações
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-gradient-to-br from-card to-amber-500/5">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              Superações (Overachievement)
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-500">
                +{metrics.overachievementCount}
              </span>
              <span className="text-xs text-muted-foreground">extras</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Acima da cota estipulada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Double Bar Chart: Esperado vs. Alcançado */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-health-primary" />
              <CardTitle className="text-base font-semibold">
                Comparativo Esperado vs. Alcançado (
                {data?.periodType === "MONTH" ? "Visão Mensal" : "Visão Semanal"})
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500/60" />
                Esperado
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Alcançado
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              Nenhum dado disponível para o período selecionado. Crie hábitos e registre execuções para visualizar o gráfico.
            </div>
          ) : (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={series}
                  margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} hábito(s)`,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="totalExpectedForBar"
                    name="Esperado"
                    fill="#6366F1"
                    fillOpacity={0.55}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="totalAchievedForBar"
                    name="Alcançado"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horizontal Breakdown per Habit */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base font-semibold">
                Desempenho Individual por Hábito (Cotas & Superação)
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">
              Trava de 100% na média geral · Superação visível por hábito
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {breakdown.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Nenhum hábito avaliado neste ciclo.
            </div>
          ) : (
            breakdown.map((item) => {
              const isOverachieved =
                item.statusBadge === "OVERACHIEVED" ||
                (item.expectedInPeriod > 0 &&
                  item.achievedRawInPeriod > item.expectedInPeriod);
              const isGoalMet =
                item.statusBadge === "COMPLETED" ||
                isOverachieved ||
                (item.expectedInPeriod > 0 &&
                  item.achievedRawInPeriod >= item.expectedInPeriod);
              const fillPercent = Math.min(100, Math.max(0, item.percentageCapped));

              return (
                <div
                  key={item.habitId}
                  className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2 transition-all hover:border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: item.colorHex || "#10B981",
                        }}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {item.title}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {SCHEDULE_LABELS[item.scheduleType] || item.scheduleType}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {MODE_LABELS[item.completionMode] || item.completionMode}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOverachieved ? (
                        <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 text-[11px] flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {item.achievedRawInPeriod}/{item.expectedInPeriod} — Superação (
                          {Math.round(item.percentageRaw)}%)
                        </Badge>
                      ) : isGoalMet ? (
                        <Badge
                          variant="health"
                          className="text-[11px] flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {item.achievedRawInPeriod}/{item.expectedInPeriod} — 100% Sucesso
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {item.achievedRawInPeriod} / {item.expectedInPeriod} (
                          {Math.round(item.percentageCapped)}%)
                        </Badge>
                      )}
                      {item.skippedInPeriod > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-amber-500/30 text-amber-500"
                        >
                          {item.skippedInPeriod} skip
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverachieved
                          ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400"
                          : isGoalMet
                          ? "bg-emerald-500"
                          : "bg-indigo-500"
                      }`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
