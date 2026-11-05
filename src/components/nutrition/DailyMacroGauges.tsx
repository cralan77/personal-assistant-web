"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Beef, Wheat, Droplet, Sparkles } from "lucide-react";
import { MacroNutrientSummary, NutritionGoalsProgress } from "@/types";

interface DailyMacroGaugesProps {
  totals: MacroNutrientSummary;
  goals?: NutritionGoalsProgress | null;
}

export function DailyMacroGauges({ totals, goals }: DailyMacroGaugesProps) {
  const targetCalories = goals?.targetCalories || 2000;
  const targetProtein = goals?.targetProteinG || 150;
  const targetCarbs = goals?.targetCarbsG || 200;
  const targetFat = goals?.targetFatG || 60;

  const calPercent = Math.min(100, Math.round((totals.calories / targetCalories) * 100));
  const protPercent = Math.min(100, Math.round((totals.proteinG / targetProtein) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbsG / targetCarbs) * 100));
  const fatPercent = Math.min(100, Math.round((totals.fatG / targetFat) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Calorias */}
      <Card className="border border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            Calorias Diárias
          </CardTitle>
          <Badge variant="outline" className="text-xs font-semibold border-orange-500/30 text-orange-500">
            {calPercent}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(totals.calories)}{" "}
              <span className="text-xs font-normal text-muted-foreground">kcal</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Meta: {targetCalories} kcal
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            Restam: {Math.max(0, Math.round(targetCalories - totals.calories))} kcal
          </div>
        </CardContent>
      </Card>

      {/* Proteínas */}
      <Card className="border border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Beef className="h-4 w-4 text-rose-500" />
            Proteínas
          </CardTitle>
          <Badge variant="outline" className="text-xs font-semibold border-rose-500/30 text-rose-500">
            {protPercent}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-bold text-foreground">
              {totals.proteinG.toFixed(1)}{" "}
              <span className="text-xs font-normal text-muted-foreground">g</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Meta: {targetProtein}g
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${protPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 flex justify-between">
            <span>{totals.proteinCaloriesPercent}% das calorias</span>
            <span>Restam: {Math.max(0, targetProtein - totals.proteinG).toFixed(0)}g</span>
          </div>
        </CardContent>
      </Card>

      {/* Carboidratos */}
      <Card className="border border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Wheat className="h-4 w-4 text-sky-500" />
            Carboidratos
          </CardTitle>
          <Badge variant="outline" className="text-xs font-semibold border-sky-500/30 text-sky-500">
            {carbsPercent}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-bold text-foreground">
              {totals.carbsG.toFixed(1)}{" "}
              <span className="text-xs font-normal text-muted-foreground">g</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Meta: {targetCarbs}g
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 flex justify-between">
            <span>Líquidos: {totals.netCarbsG.toFixed(1)}g (Fibras: {totals.fiberG.toFixed(1)}g)</span>
            <span>{totals.carbsCaloriesPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Gorduras */}
      <Card className="border border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-500" />
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Droplet className="h-4 w-4 text-yellow-500" />
            Gorduras
          </CardTitle>
          <Badge variant="outline" className="text-xs font-semibold border-yellow-500/30 text-yellow-500">
            {fatPercent}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-bold text-foreground">
              {totals.fatG.toFixed(1)}{" "}
              <span className="text-xs font-normal text-muted-foreground">g</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Meta: {targetFat}g
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 flex justify-between">
            <span>{totals.fatCaloriesPercent}% das calorias</span>
            <span>Restam: {Math.max(0, targetFat - totals.fatG).toFixed(0)}g</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
