"use client";

import { Sparkles, Moon, Dumbbell, DollarSign, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiMorningBriefing } from "@/types";
import { formatDateTimeBR } from "@/lib/utils";

interface MorningBriefingCardProps {
  briefing?: AiMorningBriefing | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function MorningBriefingCard({
  briefing,
  isLoading,
  onRefresh,
}: MorningBriefingCardProps) {
  const readiness = briefing?.readinessScore ?? 85;

  // Cor do score de prontidão
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500";
    if (score >= 60) return "text-amber-500 border-amber-500";
    return "text-rose-500 border-rose-500";
  };

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
              Análise fisiológica e financeira integrada com a Aurora
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
              className={`h-4 w-4 ${isLoading ? "animate-spin text-gemini-purple" : ""}`}
            />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Readiness Score & Headline */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl bg-muted/40 p-4 border border-border/50">
          <div
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 font-bold ${getScoreColor(
              readiness
            )}`}
          >
            <span className="text-lg leading-none">{readiness}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Score
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {briefing?.headline || "Prontidão cardiovascular excelente para o dia."}
            </h4>
            <p className="text-xs text-muted-foreground">
              Gerado em: {formatDateTimeBR(briefing?.generatedAt)}
            </p>
          </div>
        </div>

        {/* 3 Insight Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Sono */}
          <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center space-x-2 text-secondary">
              <Moon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Recuperação de Sono
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {briefing?.sleepAnalysis ||
                "Duração e qualidade dentro da meta com bom tempo em sono profundo."}
            </p>
          </div>

          {/* Treino Sugerido */}
          <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center space-x-2 text-health-primary">
              <Dumbbell className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Treino do Dia
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {briefing?.workoutSuggestion ||
                "Sessão moderada recomendada. Priorize controle de batimentos em Z2/Z3."}
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
            <p className="text-xs text-muted-foreground leading-relaxed">
              {briefing?.financialAdvice ||
                "Suas faturas do mês estão controladas. Saldo líquido saudável."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
