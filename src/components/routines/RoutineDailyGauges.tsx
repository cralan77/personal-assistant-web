"use client";

import { DailyRoutineGauge, FlexibleHabitPeriodItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Flame, Sparkles, PauseCircle, CalendarRange } from "lucide-react";
import { formatDateBR } from "@/lib/utils";

interface RoutineDailyGaugesProps {
  gauge?: DailyRoutineGauge;
  flexibleHabits?: FlexibleHabitPeriodItem[];
  weekWindow?: {
    startDate: string;
    endDate: string;
    weekStartDay: string;
  };
  urgentTodosCount?: number;
}

const WEEK_DAY_LABELS: Record<string, string> = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export function RoutineDailyGauges({
  gauge,
  flexibleHabits = [],
  weekWindow,
  urgentTodosCount = 0,
}: RoutineDailyGaugesProps) {
  const fixedExpected = gauge?.fixedExpectedCount ?? 0;
  const fixedCompleted = gauge?.fixedCompletedCount ?? 0;
  const fixedSkipped = gauge?.fixedSkippedCount ?? 0;
  const fixedPercentage =
    gauge?.fixedSuccessPercentage !== undefined
      ? Math.min(100, Math.max(0, Math.round(gauge.fixedSuccessPercentage)))
      : fixedExpected > 0
      ? Math.min(100, Math.round((fixedCompleted / fixedExpected) * 100))
      : 100;

  const flexibleBonusToday = gauge?.flexibleCompletedTodayBonus ?? 0;

  // Calculate flexible quota progress in current period
  const totalFlexTarget = flexibleHabits.reduce(
    (acc, h) => acc + (h.periodTargetCount || 0),
    0
  );
  const totalFlexAchievedCapped = flexibleHabits.reduce(
    (acc, h) =>
      acc + Math.min(h.periodAchievedCount || 0, h.periodTargetCount || 0),
    0
  );
  const totalFlexAchievedRaw = flexibleHabits.reduce(
    (acc, h) => acc + (h.periodAchievedCount || 0),
    0
  );

  const computedFlexConsistency =
    gauge?.weeklyConsistencyPercentage !== undefined
      ? Math.round(gauge.weeklyConsistencyPercentage)
      : totalFlexTarget > 0
      ? Math.round((totalFlexAchievedCapped / totalFlexTarget) * 100)
      : fixedPercentage;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const fixedStrokeDashoffset =
    circumference - (fixedPercentage / 100) * circumference;
  const flexStrokeDashoffset =
    circumference -
    (Math.min(100, Math.max(0, computedFlexConsistency)) / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Gauge 1: Hábitos Fixos do Dia */}
      <Card className="border-border shadow-sm bg-gradient-to-br from-card to-emerald-500/5">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-health-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hábitos Fixos de Hoje
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {fixedCompleted} / {fixedExpected}
              </span>
              <span className="text-xs text-muted-foreground">concluídos</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="health" className="text-[11px]">
                {fixedPercentage}% da meta diária
              </Badge>
              {fixedSkipped > 0 && (
                <Badge
                  variant="outline"
                  className="text-[11px] border-amber-500/40 text-amber-500 flex items-center gap-1"
                >
                  <PauseCircle className="h-3 w-3" />
                  {fixedSkipped} pulado{fixedSkipped > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          {/* SVG Progress Ring 1 */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/60"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={fixedStrokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="text-health-primary transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold text-foreground">
                {fixedPercentage}%
              </span>
              <span className="text-[10px] text-muted-foreground">Hoje</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gauge 2: Consistência Flexível & Bônus do Dia */}
      <Card className="border-border shadow-sm bg-gradient-to-br from-card to-indigo-500/5">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cotas Flexíveis & Semana
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {totalFlexAchievedRaw} / {totalFlexTarget}
              </span>
              <span className="text-xs text-muted-foreground">
                cotas no ciclo
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge
                variant="secondary"
                className="text-[11px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-transparent"
              >
                +{flexibleBonusToday} bônus hoje
              </Badge>
              {totalFlexAchievedRaw > totalFlexTarget && totalFlexTarget > 0 && (
                <Badge className="text-[11px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                  +{totalFlexAchievedRaw - totalFlexTarget} Superação!
                </Badge>
              )}
            </div>
          </div>

          {/* SVG Progress Ring 2 */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/60"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={flexStrokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="text-indigo-500 transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold text-foreground">
                {computedFlexConsistency}%
              </span>
              <span className="text-[10px] text-muted-foreground">Ciclo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Janela da Semana & Resumo de Tarefas */}
      <Card className="border-border shadow-sm md:col-span-2 lg:col-span-1">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Janela da Semana
              </span>
            </div>
            {weekWindow?.weekStartDay && (
              <Badge variant="outline" className="text-[10px]">
                Início:{" "}
                {WEEK_DAY_LABELS[weekWindow.weekStartDay] ||
                  weekWindow.weekStartDay}
              </Badge>
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-foreground">
              {weekWindow
                ? `${formatDateBR(weekWindow.startDate)} — ${formatDateBR(
                    weekWindow.endDate
                  )}`
                : "Ciclo Semanal Atual"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Concluir tarefas vinculadas avança automaticamente a meta dos seus hábitos.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              To-Dos urgentes / hoje:
            </span>
            <span className="font-bold text-foreground">
              {urgentTodosCount} pendente{urgentTodosCount === 1 ? "" : "s"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
