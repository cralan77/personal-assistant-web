"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/lib/api/services";
import { BodySilhouetteView } from "@/components/body/BodySilhouetteView";
import { MeasurementModal } from "@/components/body/MeasurementModal";
import { HealthGoalsModal } from "@/components/body/HealthGoalsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricQuickCard } from "@/components/home/MetricQuickCard";
import { formatDateBR } from "@/lib/utils";
import {
  Activity,
  Plus,
  Scale,
  Percent,
  Flame,
  Award,
  History,
  Pencil,
  Trash2,
  Target,
} from "lucide-react";
import { BodyMeasurementEntry } from "@/types";

export default function BodyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<BodyMeasurementEntry | null>(null);

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ["body-summary"],
    queryFn: () => healthService.getSummary(),
  });

  const { data: goals, refetch: refetchGoals } = useQuery({
    queryKey: ["health-goals"],
    queryFn: () => healthService.getGoals(),
  });

  const { data: measurements = [], refetch: refetchMeasurements } = useQuery({
    queryKey: ["body-measurements"],
    queryFn: () => healthService.listBodyMeasurements(),
  });

  const latest = measurements[0];

  const handleSuccess = (newEntry: BodyMeasurementEntry) => {
    refetchSummary();
    refetchMeasurements();
  };

  const handleGoalsSuccess = () => {
    refetchGoals();
    refetchSummary();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este registro de avaliação física?")) return;
    try {
      await healthService.deleteBodyMeasurement(id);
      refetchSummary();
      refetchMeasurements();
    } catch (err) {
      console.error("Erro ao excluir medição:", err);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-primary/10 text-health-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Composição Corporal & Antropometria
            </h2>
            <p className="text-sm text-muted-foreground">
              Protocolos de Pollock (3/7 dobras cutâneas), U.S. Navy e evolução de massa magra e gordura.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setGoalsModalOpen(true)}
            className="text-xs h-10 px-3.5 border-border hover:bg-muted shadow-sm flex items-center gap-1.5"
          >
            <Target className="h-4 w-4 text-health-primary" />
            <span>Definir Metas</span>
          </Button>
          <Button
            onClick={() => {
              setSelectedMeasurement(null);
              setModalOpen(true);
            }}
            className="bg-health-primary hover:bg-health-dark text-white text-xs h-10 px-4 shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Avaliação Física
          </Button>
        </div>
      </div>

      {/* Composition Key Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Peso */}
        <MetricQuickCard
          title="Peso Atual"
          value={latest?.weightKg ? `${latest.weightKg} kg` : summary?.currentWeightKg ? `${summary.currentWeightKg} kg` : "-- kg"}
          subtitle={summary?.targetWeightKg ? `Meta: ${summary.targetWeightKg} kg` : "Definir meta"}
          icon={Scale}
          iconColor="text-health-primary"
          iconBg="bg-health-primary/10"
          onClick={() => setGoalsModalOpen(true)}
        />

        {/* % Gordura */}
        <MetricQuickCard
          title="% de Gordura"
          value={
            latest?.analysis?.bodyFatPercentage
              ? `${latest.analysis.bodyFatPercentage}%`
              : summary?.bodyFatPercentage
              ? `${summary.bodyFatPercentage}%`
              : "--%"
          }
          subtitle={
            summary?.targetBodyFatPercentage
              ? `Meta: ${summary.targetBodyFatPercentage}%`
              : latest?.analysis?.methodUsed || "Definir meta"
          }
          icon={Percent}
          iconColor="text-secondary"
          iconBg="bg-secondary/10"
          onClick={() => setGoalsModalOpen(true)}
        />

        {/* Massa Magra */}
        <MetricQuickCard
          title="Massa Magra"
          value={
            latest?.analysis?.leanMassKg
              ? `${latest.analysis.leanMassKg} kg`
              : summary?.leanMassKg
              ? `${summary.leanMassKg} kg`
              : "-- kg"
          }
          subtitle="Músculos, ossos e água"
          icon={Award}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />

        {/* Massa Gorda */}
        <MetricQuickCard
          title="Massa Gorda"
          value={
            latest?.analysis?.fatMassKg
              ? `${latest.analysis.fatMassKg} kg`
              : summary?.fatMassKg
              ? `${summary.fatMassKg} kg`
              : "-- kg"
          }
          subtitle={`IMC: ${latest?.analysis?.bmi || summary?.bmi || "--"}`}
          icon={Flame}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Current Measurements & Skinfolds Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">
          {latest ? `Última Medição Detalhada (${formatDateBR(latest.dateUtcIso)})` : "Medição Corporal"}
        </h3>
        <BodySilhouetteView
          circumferences={latest?.circumferences}
          skinfolds={latest?.skinfolds}
        />
      </div>

      {/* History of Evaluations Table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Histórico de Avaliações Físicas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Peso</th>
                  <th className="px-4 py-3">% Gordura</th>
                  <th className="px-4 py-3">Massa Magra</th>
                  <th className="px-4 py-3">Massa Gorda</th>
                  <th className="px-4 py-3">IMC</th>
                  <th className="px-4 py-3">Protocolo</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {measurements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma avaliação física cadastrada ainda. Clique em &quot;Nova Avaliação Física&quot; para registrar.
                    </td>
                  </tr>
                ) : (
                  measurements.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">
                        {formatDateBR(m.dateUtcIso)}
                      </td>
                      <td className="px-4 py-3 font-bold">{m.weightKg} kg</td>
                      <td className="px-4 py-3 text-secondary font-bold">
                        {m.analysis?.bodyFatPercentage}%
                      </td>
                      <td className="px-4 py-3 text-emerald-500 font-bold">
                        {m.analysis?.leanMassKg} kg
                      </td>
                      <td className="px-4 py-3 text-amber-500 font-bold">
                        {m.analysis?.fatMassKg} kg
                      </td>
                      <td className="px-4 py-3">{m.analysis?.bmi}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.analysis?.methodUsed || "Jackson & Pollock"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMeasurement(m);
                            setModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground mr-1"
                          title="Editar avaliação física"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(m.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          title="Excluir avaliação física"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Modal */}
      <MeasurementModal
        open={modalOpen}
        onOpenChange={(isOpen) => {
          setModalOpen(isOpen);
          if (!isOpen) setSelectedMeasurement(null);
        }}
        onSuccess={handleSuccess}
        initialData={selectedMeasurement}
      />

      {/* Health Goals Modal */}
      <HealthGoalsModal
        open={goalsModalOpen}
        onOpenChange={setGoalsModalOpen}
        onSuccess={handleGoalsSuccess}
        currentWeightKg={latest?.weightKg || summary?.currentWeightKg}
        currentBodyFatPercentage={latest?.analysis?.bodyFatPercentage || summary?.bodyFatPercentage}
        initialGoals={goals}
      />
    </div>
  );
}
