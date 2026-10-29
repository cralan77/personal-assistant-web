import Link from "next/link";
import { WorkoutSession } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrimpBadge } from "./TrimpBadge";
import { formatDateTimeBR, formatDurationSeconds } from "@/lib/utils";
import { Dumbbell, Heart, Flame, ChevronRight, Gauge } from "lucide-react";

interface WorkoutCardProps {
  workout: WorkoutSession;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Link href={`/workouts/${workout.id}`} className="block group">
      <Card className="border-border shadow-sm transition-all group-hover:border-health-primary/50 group-hover:shadow-md">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Header: Type and Title */}
            <div className="flex items-start space-x-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-health-primary/10 text-health-primary">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
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
                <h4 className="text-sm sm:text-base font-semibold text-foreground truncate group-hover:text-health-primary transition-colors">
                  {workout.title || workout.exerciseTypeName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatDateTimeBR(workout.timing.startUtcIso8601)}
                </p>
              </div>
            </div>

            {/* Metrics Chips & Action */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Duration */}
              <div className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
                <span>Duração: </span>
                <strong className="text-foreground">
                  {workout.timing.durationFormatted ||
                    formatDurationSeconds(workout.timing.durationSeconds)}
                </strong>
              </div>

              {/* Calories */}
              {workout.metrics.totalCaloriesKcal && (
                <div className="flex items-center space-x-1 rounded-lg bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-rose-500" />
                  <strong className="text-foreground">
                    {Math.round(workout.metrics.totalCaloriesKcal)} kcal
                  </strong>
                </div>
              )}

              {/* Heart Rate */}
              {workout.heartRateData.avgBpm && (
                <div className="flex items-center space-x-1 rounded-lg bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
                  <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                  <strong className="text-foreground">
                    {Math.round(workout.heartRateData.avgBpm)} bpm
                  </strong>
                </div>
              )}

              {/* TRIMP */}
              <TrimpBadge trainingLoad={workout.trainingLoad} />

              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-health-primary group-hover:translate-x-0.5 transition-all hidden sm:block" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
