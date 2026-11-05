"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Clock, Utensils, Zap } from "lucide-react";
import { Meal, MealType } from "@/types";
import { healthService } from "@/lib/api/services";

interface MealSectionProps {
  meals: Meal[];
  onOpenLogModal: (defaultType?: MealType) => void;
  onMealDeleted: () => void;
}

const MEAL_TYPE_CONFIG: Record<
  MealType,
  { label: string; defaultTime: string; icon: string }
> = {
  BREAKFAST: { label: "Café da Manhã", defaultTime: "08:00", icon: "☕" },
  LUNCH: { label: "Almoço", defaultTime: "12:30", icon: "🥗" },
  DINNER: { label: "Jantar", defaultTime: "20:00", icon: "🍽️" },
  SNACK: { label: "Lanches & Snacks", defaultTime: "16:00", icon: "🍎" },
  SUPPER: { label: "Ceia", defaultTime: "22:00", icon: "🌙" },
};

export function MealSection({ meals, onOpenLogModal, onMealDeleted }: MealSectionProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await healthService.deleteMeal(id);
      onMealDeleted();
    } catch (err) {
      console.error("Erro ao deletar refeição:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const mealOrder: MealType[] = ["BREAKFAST", "LUNCH", "SNACK", "DINNER", "SUPPER"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Utensils className="h-5 w-5 text-health-primary" />
          Diário Alimentar
        </h3>
        <Button
          size="sm"
          onClick={() => onOpenLogModal()}
          className="bg-health-primary hover:bg-health-primary/90 text-white text-xs h-8"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Registrar Refeição
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mealOrder.map((type) => {
          const typeMeals = meals.filter((m) => m.mealType === type);
          const config = MEAL_TYPE_CONFIG[type];

          const totalCalories = typeMeals.reduce((acc, m) => acc + m.totalCalories, 0);
          const totalProtein = typeMeals.reduce((acc, m) => acc + m.totalProteinG, 0);
          const totalCarbs = typeMeals.reduce((acc, m) => acc + m.totalCarbsG, 0);
          const totalFat = typeMeals.reduce((acc, m) => acc + m.totalFatG, 0);

          return (
            <Card key={type} className="border border-border/60 bg-card/60 backdrop-blur-sm">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <CardTitle className="text-sm font-semibold">{config.label}</CardTitle>
                    {typeMeals.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(totalCalories)} kcal • P: {totalProtein.toFixed(1)}g • C: {totalCarbs.toFixed(1)}g • G: {totalFat.toFixed(1)}g
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenLogModal(type)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </CardHeader>

              <CardContent className="p-4">
                {typeMeals.length === 0 ? (
                  <div className="text-xs text-muted-foreground/60 py-2 italic text-center">
                    Nenhum alimento registrado para esta refeição.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {typeMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="bg-secondary/30 rounded-lg p-3 border border-border/30 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {meal.isQuickLog ? (
                              <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 flex items-center gap-1">
                                <Zap className="h-3 w-3" /> Quick Log
                              </Badge>
                            ) : null}
                            <span className="text-xs font-semibold text-foreground">
                              {meal.name || config.label}
                            </span>
                            {meal.timeLocal && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {meal.timeLocal}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-500">
                              {Math.round(meal.totalCalories)} kcal
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingId === meal.id}
                              onClick={() => handleDelete(meal.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Itens detalhados */}
                        {meal.items && meal.items.length > 0 && (
                          <div className="divide-y divide-border/20 pt-1">
                            {meal.items.map((item) => (
                              <div
                                key={item.id}
                                className="py-1 flex items-center justify-between text-xs"
                              >
                                <span className="text-muted-foreground">
                                  {item.foodName}{" "}
                                  <span className="text-[10px] text-foreground/60 font-medium">
                                    ({item.quantity} {item.unit})
                                  </span>
                                </span>
                                <span className="text-muted-foreground text-[11px]">
                                  {Math.round(item.calories)} kcal • P: {item.proteinG.toFixed(1)}g • C: {item.carbsG.toFixed(1)}g • G: {item.fatG.toFixed(1)}g
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {meal.notes && (
                          <div className="text-[11px] text-muted-foreground/70 italic pt-1 border-t border-border/20">
                            Nota: {meal.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
