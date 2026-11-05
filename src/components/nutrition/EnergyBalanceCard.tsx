"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Dumbbell, Flame, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { EnergyBalanceSummary } from "@/types";

interface EnergyBalanceCardProps {
  energyBalance?: EnergyBalanceSummary | null;
}

export function EnergyBalanceCard({ energyBalance }: EnergyBalanceCardProps) {
  if (!energyBalance) return null;

  const {
    caloriesConsumed,
    bmrKatchMcArdle,
    workoutCaloriesBurned,
    totalEnergyExpenditure,
    netCaloricBalance,
    status,
  } = energyBalance;

  const isDeficit = status === "CALORIC_DEFICIT" || netCaloricBalance < -100;
  const isSurplus = status === "CALORIC_SURPLUS" || netCaloricBalance > 100;

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5 text-health-primary" />
          Balanço Energético Diário
        </CardTitle>
        <Badge
          className={
            isDeficit
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : isSurplus
              ? "bg-sky-500/10 text-sky-500 border border-sky-500/20"
              : "bg-muted text-muted-foreground"
          }
        >
          {isDeficit ? (
            <span className="flex items-center gap-1 font-medium">
              <TrendingDown className="h-3.5 w-3.5" /> Déficit Calórico ({Math.abs(Math.round(netCaloricBalance))} kcal)
            </span>
          ) : isSurplus ? (
            <span className="flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" /> Superávit Calórico (+{Math.round(netCaloricBalance)} kcal)
            </span>
          ) : (
            <span className="flex items-center gap-1 font-medium">
              <Minus className="h-3.5 w-3.5" /> Equilíbrio Calórico
            </span>
          )}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equação visual */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-secondary/40 rounded-lg p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block mb-1">Ingestão Alimentar</span>
            <span className="text-lg font-bold text-orange-500 flex items-center justify-center gap-1">
              <Flame className="h-4 w-4" />
              {Math.round(caloriesConsumed)} kcal
            </span>
          </div>

          <div className="bg-secondary/40 rounded-lg p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block mb-1">Metabolismo Basal (TMB)</span>
            <span className="text-lg font-bold text-foreground">
              {bmrKatchMcArdle ? Math.round(bmrKatchMcArdle) : "—"} kcal
            </span>
            <span className="text-[10px] text-muted-foreground block">Via Katch-McArdle</span>
          </div>

          <div className="bg-secondary/40 rounded-lg p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block mb-1">Gasto em Treinos</span>
            <span className="text-lg font-bold text-rose-500 flex items-center justify-center gap-1">
              <Dumbbell className="h-4 w-4" />
              {Math.round(workoutCaloriesBurned)} kcal
            </span>
          </div>

          <div className="bg-secondary/40 rounded-lg p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block mb-1">Gasto Total (TDEE)</span>
            <span className="text-lg font-bold text-foreground">
              {Math.round(totalEnergyExpenditure)} kcal
            </span>
          </div>
        </div>

        {/* Barra de comparação visual */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ingestão ({Math.round(caloriesConsumed)} kcal)</span>
            <span>Gasto Total ({Math.round(totalEnergyExpenditure)} kcal)</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden flex">
            <div
              className="bg-orange-500 h-2.5 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  totalEnergyExpenditure > 0
                    ? (caloriesConsumed / totalEnergyExpenditure) * 100
                    : 50
                )}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
