"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { healthService, assistantService } from "@/lib/api/services";
import { HeartRateZonesChart } from "@/components/workout/HeartRateZonesChart";
import { TrimpBadge } from "@/components/workout/TrimpBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTimeBR, formatDurationSeconds } from "@/lib/utils";
import {
  ArrowLeft,
  Dumbbell,
  Heart,
  Flame,
  Clock,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { AiWorkoutAnalysis } from "@/types";

export default function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const workoutId = resolvedParams.id;

  const [aiAnalysis, setAiAnalysis] = useState<AiWorkoutAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: workout, isLoading } = useQuery({
    queryKey: ["workout-detail", workoutId],
    queryFn: () => healthService.getWorkoutById(workoutId),
  });

  const handleAnalyzeWithAi = async () => {
    setIsAnalyzing(true);
    try {
      const result = await assistantService.analyzeWorkout(workoutId);
      setAiAnalysis(result);
    } catch (err) {
      console.error("Erro na análise:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="space-y-4">
        <Link href="/workouts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Treinos
          </Button>
        </Link>
        <Card className="p-8 text-center border-border">
          <p className="text-muted-foreground">Treino não encontrado.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/workouts">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-health-primary">
                {workout.exerciseTypeName}
              </span>
              {workout.isSamsungHealth && (
                <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-medium text-secondary">
                  Samsung Health
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {workout.title || workout.exerciseTypeName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {formatDateTimeBR(workout.timing.startUtcIso8601)}
            </p>
          </div>
        </div>

        <Button
          onClick={handleAnalyzeWithAi}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-gemini-purple via-gemini-blue to-gemini-cyan text-white shadow-md hover:opacity-95 text-xs h-10 px-4"
        >
          <Sparkles className={`mr-2 h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
          {isAnalyzing ? "Aurora Analisando..." : "Analisar com IA (Aurora)"}
        </Button>
      </div>

      {/* AI Analysis Result Card (se acionada) */}
      {aiAnalysis && (
        <Card className="border-gemini-purple/30 bg-gradient-to-br from-card via-card to-gemini-purple/10 shadow-md">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-gemini-purple" />
              <CardTitle className="text-base font-semibold">
                {aiAnalysis.title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              {aiAnalysis.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-3.5 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Feedback de Carga (TRIMP)
                </span>
                <p className="text-xs text-foreground mt-1">
                  {aiAnalysis.trimpFeedback}
                </p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Tempo Estimado de Recuperação
                </span>
                <p className="text-lg font-bold text-health-primary mt-0.5">
                  {aiAnalysis.recoveryTimeHours} horas
                </p>
              </div>
            </div>

            {aiAnalysis.recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recomendações Pós-Treino:
                </h4>
                <ul className="space-y-1.5">
                  {aiAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-health-primary shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Duração</span>
            </div>
            <p className="text-xl font-bold text-foreground mt-1">
              {workout.timing.durationFormatted ||
                formatDurationSeconds(workout.timing.durationSeconds)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-rose-500">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Calorias</span>
            </div>
            <p className="text-xl font-bold text-foreground mt-1">
              {workout.metrics.totalCaloriesKcal
                ? `${Math.round(workout.metrics.totalCaloriesKcal)} kcal`
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-rose-500">
              <Heart className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">FC Média / Máx</span>
            </div>
            <p className="text-xl font-bold text-foreground mt-1">
              {workout.heartRateData.avgBpm
                ? `${Math.round(workout.heartRateData.avgBpm)} / ${
                    workout.heartRateData.maxBpm || "-"
                  } bpm`
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Carga TRIMP
            </span>
            <div className="mt-1">
              <TrimpBadge trainingLoad={workout.trainingLoad} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heart Rate Zones Section */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-base font-semibold">
              Distribuição nas 5 Zonas Fisiológicas Cardíacas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <HeartRateZonesChart zones={workout.zones} />
        </CardContent>
      </Card>
    </div>
  );
}
