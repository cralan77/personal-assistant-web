"use client";

import {
  Sparkles,
  Moon,
  Dumbbell,
  DollarSign,
  RefreshCw,
  Apple,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AiMorningBriefing,
  BodyCompositionSummary,
  HealthMetricsSummary,
  FinancialSummary,
  DailyNutritionResponse,
  RoutineSummary,
} from "@/types";
import { formatCurrencyBRL, formatDateTimeBR } from "@/lib/utils";

interface MorningBriefingCardProps {
  briefing?: AiMorningBriefing | null;
  healthSummary?: BodyCompositionSummary | null;
  healthMetrics?: HealthMetricsSummary | null;
  financeSummary?: FinancialSummary | null;
  nutrition?: DailyNutritionResponse | null;
  routineSummary?: RoutineSummary | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function MorningBriefingCard({
  briefing,
  healthSummary,
  healthMetrics,
  financeSummary,
  nutrition,
  routineSummary,
  isLoading,
  onRefresh,
}: MorningBriefingCardProps) {
  // Score de prontidão cardiovascular/fisiológico real (0 a 100)
  const realScore =
    healthMetrics?.readinessScore ??
    healthSummary?.readinessScore ??
    briefing?.readinessScore;

  // Cor do score de prontidão
  const getScoreColor = (score?: number | null) => {
    if (score == null) return "text-muted-foreground border-border";
    if (score >= 80) return "text-emerald-500 border-emerald-500";
    if (score >= 60) return "text-amber-500 border-amber-500";
    return "text-rose-500 border-rose-500";
  };

  // Headline baseado em dados fisiológicos reais
  const headline =
    briefing?.headline && briefing.headline !== "Seu Resumo Diário Inteligente"
      ? briefing.headline
      : realScore != null
      ? realScore >= 80
        ? "Prontidão cardiovascular excelente para o dia."
        : realScore >= 60
        ? "Prontidão física equilibrada. Ideal para treinos de intensidade moderada."
        : "Recuperação muscular e descanso prioritários para hoje."
      : "Visão consolidada em tempo real da sua saúde, treinos e finanças.";

  // 1. Sono
  const sleepFormatted =
    healthMetrics?.recentSleepFormatted ||
    healthSummary?.recentSleepFormatted ||
    (healthSummary?.lastNightSleepMinutes
      ? `${Math.floor(healthSummary.lastNightSleepMinutes / 60)}h ${
          healthSummary.lastNightSleepMinutes % 60
        }m`
      : null);

  const sleepStatus =
    healthMetrics?.readinessStatus ||
    healthSummary?.readinessStatus ||
    "Recuperação estável";

  const sleepText =
    briefing?.sleepAnalysis && !briefing.sleepAnalysis.includes("7h30")
      ? briefing.sleepAnalysis
      : sleepFormatted && sleepFormatted !== "--"
      ? `${sleepFormatted} de sono registrado. Status: ${sleepStatus}.`
      : "Sem registro de sono recente. Sincronize seu relógio/wearable para refinar a prontidão.";

  // 2. Treino & TRIMP
  const trimp = healthMetrics?.weeklyTrimp ?? healthSummary?.weeklyTrimp;
  const loadStatus =
    healthMetrics?.trainingLoadStatus ?? healthSummary?.trainingLoadStatus;
  const lastWorkout =
    healthMetrics?.lastWorkoutSummary ?? healthSummary?.lastWorkoutSummary;

  let workoutText = briefing?.workoutSuggestion;
  if (!workoutText || workoutText.includes("corrida leve de 30 minutos na Zona 2")) {
    if (loadStatus) {
      if (
        loadStatus === "Sobrecarga / Exaustão" ||
        (realScore != null && realScore < 60)
      ) {
        workoutText = `Carga semanal elevada (${trimp} TRIMP). Recomendamos repouso ativo ou alongamentos para regeneração.`;
      } else if (loadStatus === "Carga Alta") {
        workoutText = `Carga semanal acumulada (${trimp} TRIMP). Sessão leve em Zona 2 recomendada.`;
      } else if (loadStatus === "Carga Moderada") {
        workoutText = `Carga semanal ótima (${trimp} TRIMP). Excelente dia para treino de força ou cardio principal.`;
      } else {
        workoutText = `Carga semanal leve (${trimp} TRIMP). Bom dia para treinar e progredir cargas.`;
      }
      if (lastWorkout) {
        workoutText += ` Último: ${lastWorkout}.`;
      }
    } else {
      workoutText =
        "Nenhum treino registrado recentemente. Recomendamos 30-45 min de atividade física moderada.";
    }
  }

  // 3. Nutrição & Hidratação
  const caloriesConsumed =
    healthSummary?.todayNutrition?.caloriesConsumed ??
    nutrition?.totals?.calories ??
    0;
  const targetCalories =
    healthSummary?.todayNutrition?.targetCalories ??
    nutrition?.goals?.targetCalories ??
    2000;
  const waterConsumed =
    healthSummary?.todayNutrition?.waterConsumedMl ??
    nutrition?.water?.totalConsumedMl ??
    0;
  const targetWater =
    healthSummary?.todayNutrition?.targetWaterMl ??
    nutrition?.water?.targetMl ??
    2500;

  const nutritionText =
    caloriesConsumed > 0 || waterConsumed > 0
      ? `${caloriesConsumed} kcal consumidas (meta: ${targetCalories} kcal). Água: ${waterConsumed}ml de ${targetWater}ml.`
      : "Nenhuma refeição registrada hoje. Registre no módulo Nutrição & Macros para controle calórico.";

  // 4. Finanças
  let financeText = briefing?.financialAdvice;
  if (!financeText || financeText.includes("Verifique suas contas a vencer")) {
    if (financeSummary) {
      const pending = financeSummary.pendingBillsAmount || 0;
      const balance = financeSummary.totalBalance || 0;
      if (pending > 0) {
        financeText = `R$ ${formatCurrencyBRL(
          pending
        )} em contas/faturas pendentes neste mês (${financeSummary.pendingBillsCount} a vencer). Saldo total: R$ ${formatCurrencyBRL(
          balance
        )}.`;
      } else {
        financeText = `Saldo total de R$ ${formatCurrencyBRL(
          balance
        )}. Nenhuma fatura pendente registrada no mês.`;
      }
    } else {
      financeText = "Suas finanças estão sob controle no módulo financeiro.";
    }
  }

  const completedHabits = routineSummary?.fixedCompletedToday ?? 0;
  const totalHabits = routineSummary?.fixedExpectedToday ?? 0;

  return (
    <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card via-card to-gemini-purple/5 shadow-md">
      {/* Decorative top gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gemini-purple via-gemini-blue to-gemini-cyan" />

      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-gemini-purple to-gemini-blue text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Morning Briefing Aurora
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Análise fisiológica, nutricional e financeira integrada em tempo real
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Atualizar Briefing"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin text-gemini-purple" : ""
              }`}
            />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Readiness Score & Headline */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-muted/40 p-4 border border-border/50">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 font-bold ${getScoreColor(
                realScore
              )}`}
            >
              <span className="text-lg leading-none">
                {realScore != null ? realScore : "--"}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Score
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                {headline}
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Prontidão:{" "}
                  <strong className="text-foreground">
                    {healthMetrics?.readinessStatus ||
                      healthSummary?.readinessStatus ||
                      "Calculado via sono e treinos"}
                  </strong>
                </span>
                {loadStatus && (
                  <Badge variant="outline" className="text-[10px] py-0 h-4">
                    {loadStatus}
                  </Badge>
                )}
                {briefing?.generatedAt && (
                  <span>
                    • Atualizado em {formatDateTimeBR(briefing.generatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {totalHabits > 0 && (
            <div className="hidden lg:flex items-center gap-2 bg-card/80 border border-border/60 px-3 py-1.5 rounded-lg text-xs">
              <CalendarCheck className="h-4 w-4 text-emerald-500" />
              <span>
                Hábitos hoje:{" "}
                <strong className="text-foreground">
                  {completedHabits}/{totalHabits}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* 4 Insight Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Sono */}
          <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center space-x-2 text-secondary">
              <Moon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Recuperação de Sono
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {sleepText}
            </p>
          </div>

          {/* Treino Sugerido */}
          <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center space-x-2 text-health-primary">
              <Dumbbell className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Treino & Carga
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {workoutText}
            </p>
          </div>

          {/* Nutrição Hoje */}
          <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center space-x-2 text-orange-500">
              <Apple className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Nutrição & Água
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {nutritionText}
            </p>
          </div>

          {/* Finanças */}
          <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center space-x-2 text-finance-pending">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Conselho Financeiro
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {financeText}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
