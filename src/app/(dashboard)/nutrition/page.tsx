"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Apple,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DailyMacroGauges } from "@/components/nutrition/DailyMacroGauges";
import { EnergyBalanceCard } from "@/components/nutrition/EnergyBalanceCard";
import { WaterTrackerCard } from "@/components/nutrition/WaterTrackerCard";
import { MealSection } from "@/components/nutrition/MealSection";
import { LogMealModal } from "@/components/nutrition/LogMealModal";
import { FoodCatalogModal } from "@/components/nutrition/FoodCatalogModal";
import { HealthGoalsModal } from "@/components/body/HealthGoalsModal";
import { healthService } from "@/lib/api/services";
import { getLocalDateIso } from "@/lib/utils";
import { MealType, HealthGoals } from "@/types";

export default function NutritionPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateIso());

  // Modais
  const [isLogMealOpen, setIsLogMealOpen] = useState(false);
  const [defaultMealType, setDefaultMealType] = useState<MealType>("LUNCH");
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);

  // Queries
  const {
    data: dailyNutrition,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["nutrition", "daily", selectedDate],
    queryFn: () => healthService.getDailyNutrition(selectedDate),
  });

  const { data: goals, refetch: refetchGoals } = useQuery({
    queryKey: ["health-goals"],
    queryFn: () => healthService.getGoals(),
  });

  const changeDateByDays = (days: number) => {
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleOpenLogModal = (type?: MealType) => {
    if (type) setDefaultMealType(type);
    setIsLogMealOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["nutrition", "daily", selectedDate] });
    queryClient.invalidateQueries({ queryKey: ["health-summary"] });
  };

  const isToday = selectedDate === getLocalDateIso();

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header com Navegação de Data e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Apple className="h-7 w-7 text-health-primary" />
            Nutrição & Macros
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de refeições diárias, macronutrientes, balanço calórico e hidratação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Data */}
          <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeDateByDays(-1)}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-xs font-semibold px-2 flex items-center gap-1.5 text-foreground min-w-[110px] justify-center">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {isToday ? "Hoje" : selectedDate}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeDateByDays(1)}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCatalogOpen(true)}
            className="text-xs h-9"
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            Catálogo de Alimentos
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGoalsOpen(true)}
            className="text-xs h-9"
          >
            <Target className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
            Metas Nutricionais
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenLogModal()}
            className="bg-health-primary hover:bg-health-primary/90 text-white text-xs h-9 shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Registrar Refeição
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Carregando informações nutricionais...
        </div>
      ) : dailyNutrition ? (
        <div className="space-y-6">
          {/* 1. KPIs dos Macros do Dia */}
          <DailyMacroGauges
            totals={dailyNutrition.totals}
            goals={dailyNutrition.goals}
          />

          {/* 2. Grid com Balanço Energético, Água e Diário de Refeições */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda (1/3): Balanço Energético + Água */}
            <div className="space-y-6 lg:col-span-1">
              <EnergyBalanceCard energyBalance={dailyNutrition.energyBalance} />
              <WaterTrackerCard
                water={dailyNutrition.water}
                dateLocal={selectedDate}
                onWaterUpdated={handleSuccess}
              />
            </div>

            {/* Coluna Direita (2/3): Lista de Refeições */}
            <div className="lg:col-span-2">
              <MealSection
                meals={dailyNutrition.meals}
                onOpenLogModal={handleOpenLogModal}
                onMealDeleted={handleSuccess}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhum dado encontrado para a data selecionada.
        </div>
      )}

      {/* Modais */}
      <LogMealModal
        open={isLogMealOpen}
        onOpenChange={setIsLogMealOpen}
        dateLocal={selectedDate}
        defaultMealType={defaultMealType}
        onSuccess={handleSuccess}
      />

      <FoodCatalogModal
        open={isCatalogOpen}
        onOpenChange={setIsCatalogOpen}
      />

      <HealthGoalsModal
        open={isGoalsOpen}
        onOpenChange={setIsGoalsOpen}
        initialGoals={goals}
        onSuccess={(updated) => {
          refetchGoals();
          refetch();
        }}
      />
    </div>
  );
}
