"use client";

import { HeartRateZones } from "@/types";
import { formatDurationSeconds } from "@/lib/utils";

interface HeartRateZonesChartProps {
  zones?: HeartRateZones | null;
}

export function HeartRateZonesChart({ zones }: HeartRateZonesChartProps) {
  if (!zones || zones.totalSecondsInZones <= 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
        Nenhuma amostra contínua de frequência cardíaca registrada para cálculo de zonas.
      </div>
    );
  }

  const total = zones.totalSecondsInZones;

  const zoneConfigs = [
    {
      name: "Z1 - Recuperação Ativa",
      range: "50% - 60%",
      seconds: zones.zone1RecoverySeconds,
      color: "bg-zones-1",
      textColor: "text-slate-500",
      description: "Recuperação neuromuscular e aeróbica leve.",
    },
    {
      name: "Z2 - Aeróbico / Queima de Gordura",
      range: "60% - 70%",
      seconds: zones.zone2AerobicSeconds,
      color: "bg-zones-2",
      textColor: "text-sky-500",
      description: "Construção de base mitocondrial e oxidação lipídica.",
    },
    {
      name: "Z3 - Tempo / Ritmo",
      range: "70% - 80%",
      seconds: zones.zone3TempoSeconds,
      color: "bg-zones-3",
      textColor: "text-emerald-500",
      description: "Resistência aeróbica sustentada.",
    },
    {
      name: "Z4 - Limiar Anaeróbico",
      range: "80% - 90%",
      seconds: zones.zone4ThresholdSeconds,
      color: "bg-zones-4",
      textColor: "text-amber-500",
      description: "Elevação do limiar de lactato e velocidade sustentada.",
    },
    {
      name: "Z5 - Anaeróbico / Potência Máxima",
      range: "90% - 100%",
      seconds: zones.zone5AnaerobicSeconds,
      color: "bg-zones-5",
      textColor: "text-rose-500",
      description: "Esforço neuromuscular máximo em picos curtos.",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Visual Consolidated Multi-segment Bar */}
      <div className="h-4 w-full overflow-hidden rounded-full bg-muted flex shadow-inner">
        {zoneConfigs.map((zone, idx) => {
          const percent = total > 0 ? (zone.seconds / total) * 100 : 0;
          if (percent <= 0) return null;
          return (
            <div
              key={idx}
              className={`${zone.color} transition-all duration-500`}
              style={{ width: `${percent}%` }}
              title={`${zone.name}: ${percent.toFixed(1)}% (${formatDurationSeconds(zone.seconds)})`}
            />
          );
        })}
      </div>

      {/* Individual Zone Breakdown */}
      <div className="space-y-2.5">
        {zoneConfigs.map((zone, idx) => {
          const percent = total > 0 ? (zone.seconds / total) * 100 : 0;
          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-card border border-border/60 p-3 text-xs gap-2"
            >
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${zone.color} shrink-0`} />
                <div>
                  <span className="font-semibold text-foreground">{zone.name}</span>
                  <span className="ml-2 text-muted-foreground">({zone.range})</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4">
                <span className="text-muted-foreground font-mono">
                  {formatDurationSeconds(zone.seconds)}
                </span>
                <span className="font-bold font-mono min-w-12 text-right text-foreground">
                  {percent.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
