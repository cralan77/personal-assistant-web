"use client";

import { useEffect, useState } from "react";
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
import {
  CompletionMode,
  CreateHabitPayload,
  DayOfWeek,
  Habit,
  HealthTriggerType,
  QuotaCountMode,
  ScheduleType,
  TodoCategory,
} from "@/types";
import {
  useCreateHabit,
  useCreateTodoCategory,
  useUpdateHabit,
} from "@/lib/hooks/use-routines";
import { AlertCircle, Plus } from "lucide-react";

interface HabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHabit?: Habit | null;
  categories: TodoCategory[];
}

const WEEK_DAYS: { key: DayOfWeek; short: string; label: string }[] = [
  { key: "MONDAY", short: "Seg", label: "Segunda" },
  { key: "TUESDAY", short: "Ter", label: "Terça" },
  { key: "WEDNESDAY", short: "Qua", label: "Quarta" },
  { key: "THURSDAY", short: "Qui", label: "Quinta" },
  { key: "FRIDAY", short: "Sex", label: "Sexta" },
  { key: "SATURDAY", short: "Sáb", label: "Sábado" },
  { key: "SUNDAY", short: "Dom", label: "Domingo" },
];

const COLOR_PRESETS = [
  "#10B981",
  "#6366F1",
  "#0EA5E9",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

const ICON_PRESETS = [
  { value: "check-circle", label: "Check" },
  { value: "dumbbell", label: "Treino" },
  { value: "droplets", label: "Água" },
  { value: "book-open", label: "Leitura" },
  { value: "home", label: "Casa" },
  { value: "footprints", label: "Passos" },
  { value: "scale", label: "Peso" },
  { value: "sparkles", label: "Foco" },
];

export function HabitModal({
  open,
  onOpenChange,
  initialHabit,
  categories,
}: HabitModalProps) {
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const createCategoryMutation = useCreateTodoCategory();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [colorHex, setColorHex] = useState("#10B981");
  const [icon, setIcon] = useState("check-circle");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("DAILY");
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>([
    "MONDAY",
    "WEDNESDAY",
    "FRIDAY",
  ]);
  const [daysOfMonthInput, setDaysOfMonthInput] = useState("1, 15");
  const [targetCountPerPeriod, setTargetCountPerPeriod] = useState<number>(3);
  const [quotaCountMode, setQuotaCountMode] =
    useState<QuotaCountMode>("DAYS_COMPLETED");
  const [completionMode, setCompletionMode] = useState<CompletionMode>("CHECK");
  const [dailyTargetValue, setDailyTargetValue] = useState<number>(2000);
  const [unit, setUnit] = useState("ml");
  const [linkedTodoCategoryId, setLinkedTodoCategoryId] = useState<string>("");
  const [healthTriggerType, setHealthTriggerType] =
    useState<HealthTriggerType>("WORKOUT_SESSION");
  const [healthExerciseType, setHealthExerciseType] = useState("ANY");
  const [healthMinDurationMinutes, setHealthMinDurationMinutes] =
    useState<number>(20);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    if (initialHabit) {
      setTitle(initialHabit.title || "");
      setDescription(initialHabit.description || "");
      setColorHex(initialHabit.colorHex || "#10B981");
      setIcon(initialHabit.icon || "check-circle");
      setScheduleType(initialHabit.scheduleType || "DAILY");
      setDaysOfWeek(
        initialHabit.daysOfWeek && initialHabit.daysOfWeek.length > 0
          ? initialHabit.daysOfWeek
          : ["MONDAY", "WEDNESDAY", "FRIDAY"]
      );
      setDaysOfMonthInput(
        initialHabit.daysOfMonth && initialHabit.daysOfMonth.length > 0
          ? initialHabit.daysOfMonth.join(", ")
          : "1, 15"
      );
      setTargetCountPerPeriod(initialHabit.targetCountPerPeriod || 1);
      setQuotaCountMode(initialHabit.quotaCountMode || "DAYS_COMPLETED");
      setCompletionMode(initialHabit.completionMode || "CHECK");
      setDailyTargetValue(initialHabit.dailyTargetValue || 1);
      setUnit(initialHabit.unit || "");
      setLinkedTodoCategoryId(initialHabit.linkedTodoCategoryId || "");
      setHealthTriggerType(
        initialHabit.healthTriggerType || "WORKOUT_SESSION"
      );
      setHealthExerciseType(initialHabit.healthExerciseType || "ANY");
      setHealthMinDurationMinutes(
        initialHabit.healthMinDurationMinutes || 20
      );
    } else {
      setTitle("");
      setDescription("");
      setColorHex("#10B981");
      setIcon("check-circle");
      setScheduleType("DAILY");
      setDaysOfWeek(["MONDAY", "WEDNESDAY", "FRIDAY"]);
      setDaysOfMonthInput("1, 15");
      setTargetCountPerPeriod(3);
      setQuotaCountMode("DAYS_COMPLETED");
      setCompletionMode("CHECK");
      setDailyTargetValue(2000);
      setUnit("ml");
      setLinkedTodoCategoryId(categories[0]?.id || "");
      setHealthTriggerType("WORKOUT_SESSION");
      setHealthExerciseType("ANY");
      setHealthMinDurationMinutes(20);
    }
  }, [initialHabit, open, categories]);

  const toggleDayOfWeek = (day: DayOfWeek) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreateInlineCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const created = await createCategoryMutation.mutateAsync({
        name: newCategoryName.trim(),
        colorHex,
      });
      setLinkedTodoCategoryId(created.id);
      setNewCategoryName("");
      setShowNewCategoryInput(false);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Erro ao criar categoria."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Informe um título para o hábito.");
      return;
    }

    if (scheduleType === "FIXED_WEEKLY" && daysOfWeek.length === 0) {
      setErrorMessage("Selecione pelo menos um dia da semana.");
      return;
    }

    const parsedDaysOfMonth = daysOfMonthInput
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 31);

    if (scheduleType === "FIXED_MONTHLY" && parsedDaysOfMonth.length === 0) {
      setErrorMessage("Informe pelo menos um dia válido do mês (1 a 31).");
      return;
    }

    const effectiveTargetCount =
      scheduleType === "FLEXIBLE_WEEKLY" || scheduleType === "FLEXIBLE_MONTHLY"
        ? Math.max(1, Number(targetCountPerPeriod))
        : 1;

    const effectiveQuotaMode: QuotaCountMode =
      completionMode === "TODO_LINKED" ? "TOTAL_EXECUTIONS" : quotaCountMode;

    const payload: CreateHabitPayload = {
      title: title.trim(),
      description: description.trim() || null,
      icon,
      colorHex,
      scheduleType,
      daysOfWeek: scheduleType === "FIXED_WEEKLY" ? daysOfWeek : null,
      daysOfMonth:
        scheduleType === "FIXED_MONTHLY" ? parsedDaysOfMonth : null,
      targetCountPerPeriod: effectiveTargetCount,
      quotaCountMode: effectiveQuotaMode,
      completionMode,
      dailyTargetValue:
        completionMode === "QUANTITATIVE" ||
        (completionMode === "HEALTH_AUTO" &&
          healthTriggerType === "DAILY_STEPS")
          ? Math.max(1, Number(dailyTargetValue))
          : 1.0,
      unit:
        completionMode === "QUANTITATIVE"
          ? unit.trim() || "un"
          : completionMode === "TODO_LINKED"
          ? "tarefas"
          : completionMode === "HEALTH_AUTO" &&
            healthTriggerType === "DAILY_STEPS"
          ? "passos"
          : null,
      linkedTodoCategoryId:
        completionMode === "TODO_LINKED" && linkedTodoCategoryId
          ? linkedTodoCategoryId
          : null,
      healthTriggerType:
        completionMode === "HEALTH_AUTO" ? healthTriggerType : null,
      healthExerciseType:
        completionMode === "HEALTH_AUTO" &&
        healthTriggerType === "WORKOUT_SESSION"
          ? healthExerciseType
          : null,
      healthMinDurationMinutes:
        completionMode === "HEALTH_AUTO" &&
        healthTriggerType === "WORKOUT_SESSION"
          ? Number(healthMinDurationMinutes)
          : null,
    };

    try {
      if (initialHabit) {
        await updateHabitMutation.mutateAsync({
          id: initialHabit.id,
          payload,
        });
      } else {
        await createHabitMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Não foi possível salvar o hábito."
      );
    }
  };

  const isSaving =
    createHabitMutation.isPending || updateHabitMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[82vh] overflow-y-auto pr-1">
        <DialogHeader>
          <DialogTitle>
            {initialHabit ? "Editar Hábito / Rotina" : "Novo Hábito / Rotina"}
          </DialogTitle>
          <DialogDescription>
            Configure a frequência (fixa ou por cota flexível) e o modo de conclusão.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive mb-3">
            <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título e Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="habit-title">Nome do Hábito</Label>
            <Input
              id="habit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treinar 4x por semana, Hidratação 2.5L, 2 pendências de Casa/mês..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-desc">Descrição / Observação (Opcional)</Label>
            <Input
              id="habit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Motivação ou regra de execução..."
            />
          </div>

          {/* Cor e Ícone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cor de Destaque</Label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColorHex(c)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform ${
                      colorHex === c
                        ? "scale-110 border-foreground"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="habit-icon">Ícone</Label>
              <select
                id="habit-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs"
              >
                {ICON_PRESETS.map((ic) => (
                  <option key={ic.value} value={ic.value}>
                    {ic.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequência / Agendamento */}
          <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3.5">
            <Label htmlFor="habit-schedule">Frequência e Agendamento</Label>
            <select
              id="habit-schedule"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="DAILY">Diário (Todos os dias)</option>
              <option value="FIXED_WEEKLY">
                Semanal Fixo (Dias específicos da semana)
              </option>
              <option value="FLEXIBLE_WEEKLY">
                Semanal Flexível (Meta de N vezes na semana em qualquer dia)
              </option>
              <option value="FIXED_MONTHLY">
                Mensal Fixo (Dias específicos do mês)
              </option>
              <option value="FLEXIBLE_MONTHLY">
                Mensal Flexível (Meta de N vezes no mês em qualquer dia)
              </option>
            </select>

            {scheduleType === "FIXED_WEEKLY" && (
              <div className="pt-2 space-y-1.5">
                <span className="text-xs text-muted-foreground">
                  Selecione os dias da semana obrigatórios:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {WEEK_DAYS.map((d) => {
                    const active = daysOfWeek.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDayOfWeek(d.key)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          active
                            ? "bg-health-primary text-white shadow-sm"
                            : "bg-background border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(scheduleType === "FLEXIBLE_WEEKLY" ||
              scheduleType === "FLEXIBLE_MONTHLY") && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="habit-quota" className="text-xs">
                    Meta de Cota no{" "}
                    {scheduleType === "FLEXIBLE_WEEKLY" ? "Ciclo Semanal" : "Mês"}
                  </Label>
                  <Input
                    id="habit-quota"
                    type="number"
                    min={1}
                    max={scheduleType === "FLEXIBLE_WEEKLY" ? 7 : 31}
                    value={targetCountPerPeriod}
                    onChange={(e) =>
                      setTargetCountPerPeriod(Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="habit-quota-mode" className="text-xs">
                    Contagem da Cota
                  </Label>
                  <select
                    id="habit-quota-mode"
                    value={quotaCountMode}
                    onChange={(e) =>
                      setQuotaCountMode(e.target.value as QuotaCountMode)
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                  >
                    <option value="DAYS_COMPLETED">
                      Dias Concluídos (1x por dia)
                    </option>
                    <option value="TOTAL_EXECUTIONS">
                      Total de Execuções / Tarefas
                    </option>
                  </select>
                </div>
              </div>
            )}

            {scheduleType === "FIXED_MONTHLY" && (
              <div className="pt-2 space-y-1">
                <Label htmlFor="habit-month-days" className="text-xs">
                  Dias do Mês (separados por vírgula, ex: 1, 15, 31)
                </Label>
                <Input
                  id="habit-month-days"
                  value={daysOfMonthInput}
                  onChange={(e) => setDaysOfMonthInput(e.target.value)}
                  placeholder="1, 15"
                />
              </div>
            )}
          </div>

          {/* Modalidade de Conclusão */}
          <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3.5">
            <Label htmlFor="habit-completion">Modalidade de Conclusão</Label>
            <select
              id="habit-completion"
              value={completionMode}
              onChange={(e) => {
                const mode = e.target.value as CompletionMode;
                setCompletionMode(mode);
                if (mode === "TODO_LINKED") {
                  setQuotaCountMode("TOTAL_EXECUTIONS");
                } else if (
                  mode === "HEALTH_AUTO" &&
                  healthTriggerType === "DAILY_STEPS"
                ) {
                  setDailyTargetValue(8000);
                  setUnit("passos");
                }
              }}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="CHECK">Check Binário (Feito / Não Feito)</option>
              <option value="QUANTITATIVE">
                Quantitativo / Incremental (Ex: 2500 ml, 20 páginas)
              </option>
              <option value="TODO_LINKED">
                Interligado à To-Do List (Concluir tarefas avança o hábito)
              </option>
              <option value="HEALTH_AUTO">
                Auto-Check Saúde (Sincronizado via Health Connect)
              </option>
            </select>

            {completionMode === "QUANTITATIVE" && (
              <div className="pt-2 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="habit-target-val" className="text-xs">
                    Meta Diária Numérica
                  </Label>
                  <Input
                    id="habit-target-val"
                    type="number"
                    min={1}
                    step="any"
                    value={dailyTargetValue}
                    onChange={(e) =>
                      setDailyTargetValue(Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="habit-unit" className="text-xs">
                    Unidade (ml, páginas, min)
                  </Label>
                  <Input
                    id="habit-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="ml"
                  />
                </div>
              </div>
            )}

            {completionMode === "TODO_LINKED" && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="habit-todo-cat" className="text-xs">
                    Categoria de To-Do Monitorada (Opcional se vínculo direto)
                  </Label>
                  <button
                    type="button"
                    onClick={() =>
                      setShowNewCategoryInput(!showNewCategoryInput)
                    }
                    className="text-xs font-medium text-health-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Nova Categoria
                  </button>
                </div>

                {showNewCategoryInput && (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nome da categoria (ex: Casa, Estudos)"
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateInlineCategory}
                      disabled={createCategoryMutation.isPending}
                      className="h-8 text-xs bg-health-primary text-white"
                    >
                      Criar
                    </Button>
                  </div>
                )}

                <select
                  id="habit-todo-cat"
                  value={linkedTodoCategoryId}
                  onChange={(e) => setLinkedTodoCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="">
                    Apenas tarefas vinculadas diretamente a este hábito
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      Categoria: {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Sempre que uma tarefa principal desta categoria (ou vinculada
                  diretamente) for concluída, este hábito receberá +1 execução
                  automaticamente!
                </p>
              </div>
            )}

            {completionMode === "HEALTH_AUTO" && (
              <div className="pt-2 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="habit-health-trigger" className="text-xs">
                    Gatilho Automático do Health Service
                  </Label>
                  <select
                    id="habit-health-trigger"
                    value={healthTriggerType}
                    onChange={(e) =>
                      setHealthTriggerType(
                        e.target.value as HealthTriggerType
                      )
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                  >
                    <option value="WORKOUT_SESSION">
                      Sessão de Treino Sincronizada
                    </option>
                    <option value="DAILY_STEPS">Meta de Passos Diários</option>
                    <option value="WEIGHT_OR_BODY_LOGGED">
                      Registro de Peso ou Avaliação Física
                    </option>
                  </select>
                </div>

                {healthTriggerType === "WORKOUT_SESSION" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="habit-ex-type" className="text-xs">
                        Modalidade de Treino
                      </Label>
                      <select
                        id="habit-ex-type"
                        value={healthExerciseType}
                        onChange={(e) => setHealthExerciseType(e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
                      >
                        <option value="ANY">Qualquer Treino (ANY)</option>
                        <option value="RUNNING">Corrida (RUNNING)</option>
                        <option value="WALKING">Caminhada (WALKING)</option>
                        <option value="WEIGHTLIFTING">
                          Musculação (WEIGHTLIFTING)
                        </option>
                        <option value="CYCLING">Ciclismo (CYCLING)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="habit-min-dur" className="text-xs">
                        Duração Mínima (min)
                      </Label>
                      <Input
                        id="habit-min-dur"
                        type="number"
                        min={1}
                        value={healthMinDurationMinutes}
                        onChange={(e) =>
                          setHealthMinDurationMinutes(Number(e.target.value))
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                )}

                {healthTriggerType === "DAILY_STEPS" && (
                  <div className="space-y-1">
                    <Label htmlFor="habit-steps-goal" className="text-xs">
                      Meta de Passos no Dia
                    </Label>
                    <Input
                      id="habit-steps-goal"
                      type="number"
                      min={500}
                      step={500}
                      value={dailyTargetValue}
                      onChange={(e) =>
                        setDailyTargetValue(Number(e.target.value))
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-health-primary hover:bg-health-dark text-white"
            >
              {isSaving
                ? "Salvando..."
                : initialHabit
                ? "Salvar Alterações"
                : "Criar Hábito"}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </Dialog>
  );
}
