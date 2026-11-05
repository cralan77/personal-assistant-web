"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Plus } from "lucide-react";
import { WaterProgress } from "@/types";
import { healthService } from "@/lib/api/services";

interface WaterTrackerCardProps {
  water: WaterProgress;
  dateLocal: string;
  onWaterUpdated: () => void;
}

export function WaterTrackerCard({ water, dateLocal, onWaterUpdated }: WaterTrackerCardProps) {
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);

  const handleAddWater = async (amount: number) => {
    try {
      setLoadingAmount(amount);
      await healthService.logWater(dateLocal, amount);
      onWaterUpdated();
    } catch (err) {
      console.error("Erro ao registrar água:", err);
    } finally {
      setLoadingAmount(null);
    }
  };

  const progressPercent = Math.min(100, Math.round(water.adherencePercent || 0));

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Droplets className="h-5 w-5 text-sky-500" />
          Hidratação Diária
        </CardTitle>
        <Badge variant="outline" className="border-sky-500/30 text-sky-500 font-semibold">
          {progressPercent}%
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-foreground">
              {(water.totalConsumedMl / 1000).toFixed(2)}{" "}
              <span className="text-sm font-normal text-muted-foreground">L</span>
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              ({water.totalConsumedMl} ml)
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Meta: {(water.targetMl / 1000).toFixed(1)} L ({water.targetMl} ml)
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-400 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Botões de Ingestão Rápida */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            disabled={loadingAmount !== null}
            onClick={() => handleAddWater(250)}
            className="text-xs border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-500"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            +250 ml (Copo)
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loadingAmount !== null}
            onClick={() => handleAddWater(350)}
            className="text-xs border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-500"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            +350 ml (Caneca)
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loadingAmount !== null}
            onClick={() => handleAddWater(500)}
            className="text-xs border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-500"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            +500 ml (Garrafa)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
