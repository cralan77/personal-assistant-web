"use client";

import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/lib/api/services";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { Dumbbell, Activity, Flame, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function WorkoutsPage() {
  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["workouts-list"],
    queryFn: () => healthService.listWorkouts(),
  });

  const totalCalories = workouts.reduce(
    (acc, w) => acc + (w.metrics.totalCaloriesKcal || 0),
    0
  );
  const totalSeconds = workouts.reduce(
    (acc, w) => acc + (w.timing.durationSeconds || 0),
    0
  );
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const avgBpmGlobal = Math.round(
    workouts.reduce((acc, w) => acc + (w.heartRateData.avgBpm || 0), 0) /
      (workouts.length || 1)
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-primary/10 text-health-primary">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Treinos & Telemetria Cardiovascular
            </h2>
            <p className="text-sm text-muted-foreground">
              Histórico sincronizado com Samsung Health, zonas cardíacas e estresse fisiológico (TRIMP).
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Total de Sessões
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              {workouts.length}
            </h3>
            <p className="text-xs text-muted-foreground">Treinos registrados</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Tempo Total
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              {totalHours}h
            </h3>
            <p className="text-xs text-muted-foreground">Em movimento ativo</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Calorias Queimadas
            </p>
            <h3 className="text-2xl font-bold text-rose-500 mt-1">
              {Math.round(totalCalories).toLocaleString("pt-BR")} kcal
            </h3>
            <p className="text-xs text-muted-foreground">Gasto metabólico</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              FC Média Geral
            </p>
            <h3 className="text-2xl font-bold text-secondary mt-1">
              {avgBpmGlobal} bpm
            </h3>
            <p className="text-xs text-muted-foreground">Cardio sustentado</p>
          </CardContent>
        </Card>
      </div>

      {/* Workouts List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Sessões de Exercício</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <Card className="border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum treino registrado ainda. Sincronize pelo app mobile ou Health Connect!
            </p>
          </Card>
        ) : (
          workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))
        )}
      </div>
    </div>
  );
}
