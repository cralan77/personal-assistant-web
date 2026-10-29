"use client";

import { useMemo } from "react";
import { Habit, HabitHeatmapData, HabitHeatmapDay } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Flame } from "lucide-react";
import { formatDateBR } from "@/lib/utils";

interface HabitHeatmapProps {
  heatmap?: HabitHeatmapData;
  habits: Habit[];
  selectedMonths: number;
  onSelectMonths: (months: number) => void;
  selectedHabitId: string;
  onSelectHabitId: (habitId: string) => void;
  isLoading?: boolean;
}

const INTENSITY_CLASSES: Record<number, string> = {
  0: "bg-muted/70 border-border/40",
  1: "bg-emerald-500/25 border-emerald-500/30",
  2: "bg-emerald-500/50 border-emerald-500/40",
  3: "bg-emerald-500/75 border-emerald-500/50",
  4: "bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-500/20",
};

export function HabitHeatmap({
  heatmap,
  habits,
  selectedMonths,
  onSelectMonths,
  selectedHabitId,
  onSelectHabitId,
  isLoading,
}: HabitHeatmapProps) {
  // Build a complete grid of days for the last N months merged with backend data
  const weeksGrid = useMemo(() => {
    const mapByDate = new Map<string, HabitHeatmapDay>();
    (heatmap?.days || []).forEach((d) => {
      if (d?.date) mapByDate.set(d.date, d);
    });

    const today = new Date();
    const totalDays = selectedMonths * 30;
    const start = new Date(today);
    start.setDate(today.getDate() - totalDays + 1);

    // Align start to Monday (or Sunday) so columns represent weeks cleanly
    const dayOfWeek = start.getDay(); // 0=Sun..6=Sat
    const alignedStart = new Date(start);
    alignedStart.setDate(start.getDate() - dayOfWeek);

    const weeks: HabitHeatmapDay[][] = [];
    let currentWeek: HabitHeatmapDay[] = [];
    const cursor = new Date(alignedStart);

    while (cursor <= today) {
      const iso = cursor.toISOString().split("T")[0];
      const existing = mapByDate.get(iso);
      const item: HabitHeatmapDay = existing || {
        date: iso,
        completedCount: 0,
        expectedCount: 0,
        percentage: 0,
        intensity: 0,
      };
      currentWeek.push(item);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [heatmap?.days, selectedMonths]);

  const activeDaysCount = useMemo(() => {
    if (heatmap?.totalCompletedDays !== undefined) {
      return heatmap.totalCompletedDays;
    }
    return (heatmap?.days || []).filter(
      (d) => d.intensity > 0 || d.completedCount > 0
    ).length;
  }, [heatmap]);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-emerald-500" />
            <div>
              <CardTitle className="text-base font-semibold">
                Mapa de Calor de Consistência (Heatmap)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Histórico diário de execuções nos últimos {selectedMonths} meses
              </p>
            </div>
          </div>

          {/* Controls: Habit Filter & Months Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedHabitId}
              onChange={(e) => onSelectHabitId(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="ALL">Todos os Hábitos (Consolidado)</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSelectMonths(m)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    selectedMonths === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Carregando grade histórica de consistência...
          </div>
        ) : (
          <>
            {/* Heatmap Matrix */}
            <div className="overflow-x-auto pb-2">
              <div className="inline-flex gap-1.5 min-w-full">
                {/* Weekday labels column */}
                <div className="flex flex-col justify-between py-0.5 pr-1 text-[10px] text-muted-foreground font-medium">
                  <span>Dom</span>
                  <span>Ter</span>
                  <span>Qui</span>
                  <span>Sáb</span>
                </div>

                {/* Weeks columns */}
                <div className="flex gap-1">
                  {weeksGrid.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((day) => {
                        const level = Math.min(
                          4,
                          Math.max(0, Math.round(day.intensity || 0))
                        );
                        return (
                          <div
                            key={day.date}
                            className={`h-3.5 w-3.5 rounded-[3px] border transition-transform hover:scale-125 ${
                              INTENSITY_CLASSES[level]
                            }`}
                            title={`${formatDateBR(day.date)}: ${
                              day.completedCount
                            }/${day.expectedCount || "-"} concluídos (${Math.round(
                              day.percentage || 0
                            )}%)`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Legend & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
              <div className="flex items-center gap-3">
                <Badge variant="health" className="text-[11px]">
                  <Flame className="mr-1 h-3 w-3" />
                  {activeDaysCount} dias ativos no período
                </Badge>
                {heatmap?.currentStreak !== undefined && (
                  <span className="text-muted-foreground">
                    Ofensiva atual:{" "}
                    <strong className="text-foreground">
                      {heatmap.currentStreak}
                    </strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>Menos</span>
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <span
                    key={lvl}
                    className={`h-3 w-3 rounded-[3px] border ${INTENSITY_CLASSES[lvl]}`}
                  />
                ))}
                <span>Mais</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
