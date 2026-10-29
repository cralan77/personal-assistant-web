"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { calculateBodyComposition } from "@/lib/calculations/body-composition";
import { BodyMeasurementEntry, Gender } from "@/types";
import { healthService } from "@/lib/api/services";

interface MeasurementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newEntry: BodyMeasurementEntry) => void;
  initialData?: BodyMeasurementEntry | null;
}

interface FormValues {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;

  // Circumferences
  neckCm?: number;
  chestCm?: number;
  waistCm?: number;
  abdomenCm?: number;
  hipsCm?: number;
  rightArmCm?: number;
  leftArmCm?: number;
  rightThighCm?: number;
  leftThighCm?: number;
  rightCalfCm?: number;
  leftCalfCm?: number;

  // Skinfolds
  chestMm?: number;
  abdominalMm?: number;
  thighMm?: number;
  tricepsMm?: number;
  subscapularMm?: number;
  suprailiacMm?: number;
  midaxillaryMm?: number;
}

export function MeasurementModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: MeasurementModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      weightKg: 78.0,
      heightCm: 180,
      age: 29,
      gender: "MALE",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          weightKg: initialData.weightKg,
          heightCm: initialData.heightCm,
          age: initialData.age,
          gender: initialData.gender,
          neckCm: initialData.circumferences?.neckCm ?? undefined,
          chestCm: initialData.circumferences?.chestCm ?? undefined,
          waistCm: initialData.circumferences?.waistCm ?? undefined,
          abdomenCm: initialData.circumferences?.abdomenCm ?? undefined,
          hipsCm: initialData.circumferences?.hipsCm ?? undefined,
          rightArmCm: initialData.circumferences?.rightArmCm ?? undefined,
          leftArmCm: initialData.circumferences?.leftArmCm ?? undefined,
          rightThighCm: initialData.circumferences?.rightThighCm ?? undefined,
          leftThighCm: initialData.circumferences?.leftThighCm ?? undefined,
          rightCalfCm: initialData.circumferences?.rightCalfCm ?? undefined,
          leftCalfCm: initialData.circumferences?.leftCalfCm ?? undefined,
          chestMm: initialData.skinfolds?.chestMm ?? undefined,
          abdominalMm: initialData.skinfolds?.abdominalMm ?? undefined,
          thighMm: initialData.skinfolds?.thighMm ?? undefined,
          tricepsMm: initialData.skinfolds?.tricepsMm ?? undefined,
          subscapularMm: initialData.skinfolds?.subscapularMm ?? undefined,
          suprailiacMm: initialData.skinfolds?.suprailiacMm ?? undefined,
          midaxillaryMm: initialData.skinfolds?.midaxillaryMm ?? undefined,
        });
      } else {
        reset({
          weightKg: 78.0,
          heightCm: 180,
          age: 29,
          gender: "MALE",
        });
      }
    }
  }, [open, initialData, reset]);

  const currentValues = watch();
  // Live calculation preview
  const liveAnalysis = calculateBodyComposition({
    weightKg: Number(currentValues.weightKg) || 75,
    heightCm: Number(currentValues.heightCm) || 175,
    age: Number(currentValues.age) || 30,
    gender: currentValues.gender || "MALE",
    circumferences: {
      neckCm: currentValues.neckCm ? Number(currentValues.neckCm) : null,
      waistCm: currentValues.waistCm ? Number(currentValues.waistCm) : null,
      abdomenCm: currentValues.abdomenCm ? Number(currentValues.abdomenCm) : null,
      hipsCm: currentValues.hipsCm ? Number(currentValues.hipsCm) : null,
    },
    skinfolds: {
      chestMm: currentValues.chestMm ? Number(currentValues.chestMm) : null,
      abdominalMm: currentValues.abdominalMm ? Number(currentValues.abdominalMm) : null,
      thighMm: currentValues.thighMm ? Number(currentValues.thighMm) : null,
      tricepsMm: currentValues.tricepsMm ? Number(currentValues.tricepsMm) : null,
      suprailiacMm: currentValues.suprailiacMm ? Number(currentValues.suprailiacMm) : null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const circumferences = {
        neckCm: values.neckCm ? Number(values.neckCm) : undefined,
        chestCm: values.chestCm ? Number(values.chestCm) : undefined,
        waistCm: values.waistCm ? Number(values.waistCm) : undefined,
        abdomenCm: values.abdomenCm ? Number(values.abdomenCm) : undefined,
        hipsCm: values.hipsCm ? Number(values.hipsCm) : undefined,
        rightArmCm: values.rightArmCm ? Number(values.rightArmCm) : undefined,
        leftArmCm: values.leftArmCm ? Number(values.leftArmCm) : undefined,
        rightThighCm: values.rightThighCm ? Number(values.rightThighCm) : undefined,
        leftThighCm: values.leftThighCm ? Number(values.leftThighCm) : undefined,
        rightCalfCm: values.rightCalfCm ? Number(values.rightCalfCm) : undefined,
        leftCalfCm: values.leftCalfCm ? Number(values.leftCalfCm) : undefined,
      };

      const skinfolds = {
        chestMm: values.chestMm ? Number(values.chestMm) : undefined,
        abdominalMm: values.abdominalMm ? Number(values.abdominalMm) : undefined,
        thighMm: values.thighMm ? Number(values.thighMm) : undefined,
        tricepsMm: values.tricepsMm ? Number(values.tricepsMm) : undefined,
        subscapularMm: values.subscapularMm ? Number(values.subscapularMm) : undefined,
        suprailiacMm: values.suprailiacMm ? Number(values.suprailiacMm) : undefined,
        midaxillaryMm: values.midaxillaryMm ? Number(values.midaxillaryMm) : undefined,
      };

      const analysis = calculateBodyComposition({
        weightKg: Number(values.weightKg),
        heightCm: Number(values.heightCm),
        age: Number(values.age),
        gender: values.gender,
        circumferences,
        skinfolds,
      });

      const entry: Partial<BodyMeasurementEntry> = {
        id: initialData?.id,
        dateUtcIso: initialData?.dateUtcIso,
        weightKg: Number(values.weightKg),
        heightCm: Number(values.heightCm),
        age: Number(values.age),
        gender: values.gender,
        circumferences,
        skinfolds,
        analysis,
      };

      const saved = await healthService.saveBodyMeasurement(entry);
      onSuccess(saved);
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao salvar medição:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Editar Avaliação Antropométrica" : "Registrar Avaliação Antropométrica"}
        </DialogTitle>
        <DialogDescription>
          {initialData
            ? "Atualize as medidas corporais para recalcular automaticamente os índices e composição."
            : "Insira seus dados corporais para cálculo automático de IMC, % de gordura e massa magra."}
        </DialogDescription>
      </DialogHeader>

      {/* Live Calculated Stats Preview */}
      <div className="rounded-xl bg-health-primary/10 border border-health-primary/20 p-3 mb-4 flex items-center justify-between text-xs">
        <div>
          <span className="text-muted-foreground">IMC: </span>
          <strong className="text-foreground">{liveAnalysis.bmi}</strong>
          <span className="ml-1 text-muted-foreground">({liveAnalysis.bmiCategory})</span>
        </div>
        <div>
          <span className="text-muted-foreground">% Gordura: </span>
          <strong className="text-health-primary">{liveAnalysis.bodyFatPercentage}%</strong>
        </div>
        <div>
          <span className="text-muted-foreground">Massa Magra: </span>
          <strong className="text-foreground">{liveAnalysis.leanMassKg} kg</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basic">1. Básicos</TabsTrigger>
            <TabsTrigger value="circ">2. Medidas</TabsTrigger>
            <TabsTrigger value="skinfold">3. Dobras</TabsTrigger>
          </TabsList>

          {/* Tab 1: Dados Básicos */}
          <TabsContent value="basic" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="weightKg">Peso Atual (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  {...register("weightKg", { required: true })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="heightCm">Altura (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  step="1"
                  {...register("heightCm", { required: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="age">Idade (anos)</Label>
                <Input
                  id="age"
                  type="number"
                  {...register("age", { required: true })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gender">Sexo Biológico</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  {...register("gender")}
                >
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Feminino</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Circunferências (11 Perímetros) */}
          <TabsContent value="circ" className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="neckCm">Pescoço (cm)</Label>
                <Input id="neckCm" type="number" step="0.5" placeholder="Ex: 38" {...register("neckCm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="chestCm">Tórax (cm)</Label>
                <Input id="chestCm" type="number" step="0.5" placeholder="Ex: 100" {...register("chestCm")} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="abdomenCm">Abdômen (cm)</Label>
                <Input id="abdomenCm" type="number" step="0.5" placeholder="Ex: 85" {...register("abdomenCm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="waistCm">Cintura (cm)</Label>
                <Input id="waistCm" type="number" step="0.5" placeholder="Ex: 80" {...register("waistCm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hipsCm">Quadril (cm)</Label>
                <Input id="hipsCm" type="number" step="0.5" placeholder="Ex: 98" {...register("hipsCm")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="rightArmCm">Braço Dir. (cm)</Label>
                <Input id="rightArmCm" type="number" step="0.5" placeholder="Ex: 36" {...register("rightArmCm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="leftArmCm">Braço Esq. (cm)</Label>
                <Input id="leftArmCm" type="number" step="0.5" placeholder="Ex: 35.5" {...register("leftArmCm")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="rightThighCm">Coxa Dir. (cm)</Label>
                <Input id="rightThighCm" type="number" step="0.5" placeholder="Ex: 58" {...register("rightThighCm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="leftThighCm">Coxa Esq. (cm)</Label>
                <Input id="leftThighCm" type="number" step="0.5" placeholder="Ex: 57.5" {...register("leftThighCm")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="rightCalfCm">Panturrilha Dir. (cm)</Label>
                <Input id="rightCalfCm" type="number" step="0.5" placeholder="Ex: 38" {...register("rightCalfCm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="leftCalfCm">Panturrilha Esq. (cm)</Label>
                <Input id="leftCalfCm" type="number" step="0.5" placeholder="Ex: 38" {...register("leftCalfCm")} />
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Dobras Cutâneas (7 Dobras de Pollock) */}
          <TabsContent value="skinfold" className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <p className="text-xs text-muted-foreground mb-1">
              Preencha Peitoral, Abdômen e Coxa (para homens) ou Tríceps, Suprailíaca e Coxa (para mulheres) para cálculo de Pollock. Todas as 7 dobras são registradas no histórico.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="chestMm">Peitoral (mm)</Label>
                <Input id="chestMm" type="number" step="0.5" placeholder="mm" {...register("chestMm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="abdominalMm">Abdômen (mm)</Label>
                <Input id="abdominalMm" type="number" step="0.5" placeholder="mm" {...register("abdominalMm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="thighMm">Coxa (mm)</Label>
                <Input id="thighMm" type="number" step="0.5" placeholder="mm" {...register("thighMm")} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="tricepsMm">Tríceps (mm)</Label>
                <Input id="tricepsMm" type="number" step="0.5" placeholder="mm" {...register("tricepsMm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="subscapularMm">Subescap. (mm)</Label>
                <Input id="subscapularMm" type="number" step="0.5" placeholder="mm" {...register("subscapularMm")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="suprailiacMm">Suprail. (mm)</Label>
                <Input id="suprailiacMm" type="number" step="0.5" placeholder="mm" {...register("suprailiacMm")} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="midaxillaryMm">Axilar M. (mm)</Label>
                <Input id="midaxillaryMm" type="number" step="0.5" placeholder="mm" {...register("midaxillaryMm")} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
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
            {isSubmitting
              ? "Salvando..."
              : initialData
              ? "Salvar Alterações"
              : "Salvar Avaliação"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
