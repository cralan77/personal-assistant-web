"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Scale, Percent, Footprints, Moon } from "lucide-react";
import { HealthGoals } from "@/types";
import { healthService } from "@/lib/api/services";

interface HealthGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedGoals: HealthGoals) => void;
  currentWeightKg?: number | null;
  currentBodyFatPercentage?: number | null;
  initialGoals?: HealthGoals | null;
}

interface FormValues {
  targetWeightKg?: number;
  targetBodyFatPercentage?: number;
  targetStepsPerDay?: number;
  targetSleepMinutes?: number;
}

export function HealthGoalsModal({
  open,
  onOpenChange,
  onSuccess,
  currentWeightKg,
  currentBodyFatPercentage,
  initialGoals,
}: HealthGoalsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      targetWeightKg: initialGoals?.targetWeightKg ?? undefined,
      targetBodyFatPercentage: initialGoals?.targetBodyFatPercentage ?? undefined,
      targetStepsPerDay: initialGoals?.targetStepsPerDay ?? 10000,
      targetSleepMinutes: initialGoals?.targetSleepMinutes ?? 480,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialGoals) {
        reset({
          targetWeightKg: initialGoals.targetWeightKg ?? undefined,
          targetBodyFatPercentage: initialGoals.targetBodyFatPercentage ?? undefined,
          targetStepsPerDay: initialGoals.targetStepsPerDay ?? 10000,
          targetSleepMinutes: initialGoals.targetSleepMinutes ?? 480,
        });
      } else {
        // Fetch current goals from backend if not passed
        healthService
          .getGoals()
          .then((goals) => {
            reset({
              targetWeightKg: goals.targetWeightKg ?? undefined,
              targetBodyFatPercentage: goals.targetBodyFatPercentage ?? undefined,
              targetStepsPerDay: goals.targetStepsPerDay ?? 10000,
              targetSleepMinutes: goals.targetSleepMinutes ?? 480,
            });
          })
          .catch((err) => {
            console.warn("Erro ao buscar metas de saúde:", err);
          });
      }
    }
  }, [open, initialGoals, reset]);

  const watched = watch();
  const targetWeight = Number(watched.targetWeightKg);
  const targetFat = Number(watched.targetBodyFatPercentage);

  const weightDelta =
    currentWeightKg && targetWeight && !isNaN(targetWeight)
      ? Math.round((targetWeight - currentWeightKg) * 10) / 10
      : null;

  const fatDelta =
    currentBodyFatPercentage && targetFat && !isNaN(targetFat)
      ? Math.round((targetFat - currentBodyFatPercentage) * 10) / 10
      : null;

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<HealthGoals> = {
        targetWeightKg: values.targetWeightKg ? Number(values.targetWeightKg) : null,
        targetBodyFatPercentage: values.targetBodyFatPercentage
          ? Number(values.targetBodyFatPercentage)
          : null,
        targetStepsPerDay: values.targetStepsPerDay
          ? Number(values.targetStepsPerDay)
          : 10000,
        targetSleepMinutes: values.targetSleepMinutes
          ? Number(values.targetSleepMinutes)
          : 480,
      };

      const saved = await healthService.saveGoals(payload);
      onSuccess(saved);
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao salvar metas de saúde:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-health-primary" />
          Definir Metas de Saúde & Composição
        </DialogTitle>
        <DialogDescription>
          Estabeleça seus objetivos de peso alvo, percentual de gordura e hábitos diários.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        {/* Goal: Target Weight */}
        <div className="space-y-1.5 rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="targetWeightKg"
              className="text-xs font-bold text-foreground flex items-center gap-1.5"
            >
              <Scale className="h-4 w-4 text-health-primary" />
              Meta de Peso (kg)
            </Label>
            {currentWeightKg && (
              <span className="text-[11px] text-muted-foreground">
                Atual: <strong className="text-foreground">{currentWeightKg} kg</strong>
              </span>
            )}
          </div>
          <Input
            id="targetWeightKg"
            type="number"
            step="0.1"
            placeholder="Ex: 75.0"
            {...register("targetWeightKg")}
            className="h-10"
          />
          {weightDelta !== null && (
            <p className="text-[11px] text-muted-foreground">
              Diferença para o peso atual:{" "}
              <strong
                className={
                  weightDelta < 0
                    ? "text-health-primary"
                    : weightDelta > 0
                    ? "text-amber-500"
                    : "text-emerald-500"
                }
              >
                {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
              </strong>
            </p>
          )}
        </div>

        {/* Goal: Target Body Fat Percentage */}
        <div className="space-y-1.5 rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="targetBodyFatPercentage"
              className="text-xs font-bold text-foreground flex items-center gap-1.5"
            >
              <Percent className="h-4 w-4 text-secondary" />
              Meta de Gordura Corporal (%BF)
            </Label>
            {currentBodyFatPercentage && (
              <span className="text-[11px] text-muted-foreground">
                Atual:{" "}
                <strong className="text-foreground">{currentBodyFatPercentage}%</strong>
              </span>
            )}
          </div>
          <Input
            id="targetBodyFatPercentage"
            type="number"
            step="0.1"
            placeholder="Ex: 15.0"
            {...register("targetBodyFatPercentage")}
            className="h-10"
          />
          {fatDelta !== null && (
            <p className="text-[11px] text-muted-foreground">
              Diferença para a gordura atual:{" "}
              <strong
                className={
                  fatDelta < 0
                    ? "text-secondary"
                    : fatDelta > 0
                    ? "text-amber-500"
                    : "text-emerald-500"
                }
              >
                {fatDelta > 0 ? `+${fatDelta}` : fatDelta}%
              </strong>
            </p>
          )}
        </div>

        {/* Daily Habits: Steps & Sleep */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 rounded-xl border border-border bg-card p-3 shadow-sm">
            <Label
              htmlFor="targetStepsPerDay"
              className="text-xs font-bold text-foreground flex items-center gap-1.5"
            >
              <Footprints className="h-3.5 w-3.5 text-emerald-500" />
              Passos Diários
            </Label>
            <Input
              id="targetStepsPerDay"
              type="number"
              step="500"
              placeholder="10000"
              {...register("targetStepsPerDay")}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5 rounded-xl border border-border bg-card p-3 shadow-sm">
            <Label
              htmlFor="targetSleepMinutes"
              className="text-xs font-bold text-foreground flex items-center gap-1.5"
            >
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              Sono (minutos)
            </Label>
            <Input
              id="targetSleepMinutes"
              type="number"
              step="30"
              placeholder="480 (8h)"
              {...register("targetSleepMinutes")}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-health-primary hover:bg-health-dark text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar Metas"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
