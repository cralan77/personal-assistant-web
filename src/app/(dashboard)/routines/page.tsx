"use client";

import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Archive,
  Flame,
  FolderPlus,
  Link2,
  ListTodo,
  PauseCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  Trophy,
  BarChart3,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutineDailyGauges } from "@/components/routines/RoutineDailyGauges";
import { ExpectedVsAchievedChart } from "@/components/routines/ExpectedVsAchievedChart";
import { HabitHeatmap } from "@/components/routines/HabitHeatmap";
import { ConsistencyTrendChart } from "@/components/routines/ConsistencyTrendChart";
import { HabitModal } from "@/components/routines/HabitModal";
import { TodoModal } from "@/components/routines/TodoModal";
import { SettingsModal } from "@/components/routines/SettingsModal";
import {
  useAddSubtask,
  useAnalyticsComparison,
  useArchiveHabit,
  useCheckHabit,
  useCreateTodoCategory,
  useDailyRoutine,
  useDeleteHabit,
  useDeleteSubtask,
  useDeleteTodo,
  useDeleteTodoCategory,
  useHabitHeatmap,
  useHabits,
  useRoutineSettings,
  useSkipHabit,
  useSyncHealthHabits,
  useTodoCategories,
  useTodos,
  useToggleSubtask,
  useToggleTodo,
  useUncheckHabit,
  useUnskipHabit,
} from "@/lib/hooks/use-routines";
import {
  FixedHabitTodayItem,
  FlexibleHabitPeriodItem,
  Habit,
  TodoItem,
  TodoPriority,
  TodoStatus,
} from "@/types";
import { formatDateBR } from "@/lib/utils";

const PRIORITY_BADGE: Record<
  TodoPriority,
  { label: string; className: string }
> = {
  URGENT: {
    label: "Urgente",
    className: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  HIGH: {
    label: "Alta",
    className: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  MEDIUM: {
    label: "Média",
    className: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  },
  LOW: {
    label: "Baixa",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const DAY_SHORT_MAP: Record<string, string> = {
  MONDAY: "Seg",
  TUESDAY: "Ter",
  WEDNESDAY: "Qua",
  THURSDAY: "Qui",
  FRIDAY: "Sex",
  SATURDAY: "Sáb",
  SUNDAY: "Dom",
};

function shiftDateIso(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) + deltaDays);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function RoutinesPage() {
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [activeTab, setActiveTab] = useState<string>("today");

  // Date & Period States
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"WEEK" | "MONTH">("WEEK");
  const [analyticsRefDate, setAnalyticsRefDate] = useState<string>(todayIso);
  const [heatmapMonths, setHeatmapMonths] = useState<number>(3);
  const [heatmapHabitId, setHeatmapHabitId] = useState<string>("ALL");

  // To-Do Filters
  const [todoStatusFilter, setTodoStatusFilter] = useState<TodoStatus | "ALL">("PENDING");
  const [todoCategoryFilter, setTodoCategoryFilter] = useState<string>("ALL");
  const [todoPriorityFilter, setTodoPriorityFilter] = useState<TodoPriority | "ALL">("ALL");
  const [expandedTodoIds, setExpandedTodoIds] = useState<Record<string, boolean>>({});
  const [inlineSubtaskInputs, setInlineSubtaskInputs] = useState<Record<string, string>>({});

  // Inline Category creation on To-Do tab
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1");

  // Habits Catalog Filter
  const [showArchivedHabits, setShowArchivedHabits] = useState(false);

  // Modals State
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Queries
  const { data: dailyView, isLoading: dailyLoading } = useDailyRoutine(selectedDate);
  const { data: habits = [], isLoading: habitsLoading } = useHabits(showArchivedHabits);
  const { data: categories = [] } = useTodoCategories();
  const { data: todos = [], isLoading: todosLoading } = useTodos({
    status: todoStatusFilter,
    categoryId: todoCategoryFilter !== "ALL" ? todoCategoryFilter : undefined,
    priority: todoPriorityFilter !== "ALL" ? todoPriorityFilter : undefined,
  });
  const { data: comparisonData, isLoading: comparisonLoading } =
    useAnalyticsComparison(analyticsPeriod, analyticsRefDate);
  const { data: heatmapData, isLoading: heatmapLoading } = useHabitHeatmap(
    heatmapMonths,
    heatmapHabitId
  );
  const { data: routineSettings } = useRoutineSettings();

  // Mutations
  const checkHabitMutation = useCheckHabit();
  const uncheckHabitMutation = useUncheckHabit();
  const skipHabitMutation = useSkipHabit();
  const unskipHabitMutation = useUnskipHabit();
  const syncHealthMutation = useSyncHealthHabits();
  const archiveHabitMutation = useArchiveHabit();
  const deleteHabitMutation = useDeleteHabit();

  const toggleTodoMutation = useToggleTodo();
  const deleteTodoMutation = useDeleteTodo();
  const addSubtaskMutation = useAddSubtask();
  const toggleSubtaskMutation = useToggleSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const createCategoryMutation = useCreateTodoCategory();
  const deleteCategoryMutation = useDeleteTodoCategory();

  // Handlers for Fixed Habits Today
  const handleToggleFixedHabit = (item: FixedHabitTodayItem) => {
    const isCompleted =
      item.statusToday === "COMPLETED" || item.progressPercentage >= 100;
    if (isCompleted) {
      uncheckHabitMutation.mutate({ id: item.habitId, date: selectedDate });
    } else {
      const incrementVal =
        item.completionMode === "QUANTITATIVE"
          ? Math.max(1, item.dailyTargetValue - item.currentValueToday)
          : 1;
      checkHabitMutation.mutate({
        id: item.habitId,
        payload: { date: selectedDate, value: incrementVal },
      });
    }
  };

  const handleIncrementQuantitative = (
    item: FixedHabitTodayItem,
    delta: number
  ) => {
    checkHabitMutation.mutate({
      id: item.habitId,
      payload: { date: selectedDate, value: delta },
    });
  };

  const handleSkipToggleFixed = (item: FixedHabitTodayItem) => {
    const isSkipped = item.statusToday === "SKIPPED" || item.isSkippedToday;
    if (isSkipped) {
      unskipHabitMutation.mutate({ id: item.habitId, date: selectedDate });
    } else {
      skipHabitMutation.mutate({
        id: item.habitId,
        payload: {
          date: selectedDate,
          skipCount: 1,
          reason: "Descanso / Justificado",
        },
      });
    }
  };

  // Handlers for Flexible Habits in Period
  const handleToggleFlexibleToday = (item: FlexibleHabitPeriodItem) => {
    if (item.executedToday && item.quotaCountMode !== "TOTAL_EXECUTIONS") {
      uncheckHabitMutation.mutate({ id: item.habitId, date: selectedDate });
    } else {
      checkHabitMutation.mutate({
        id: item.habitId,
        payload: { date: selectedDate, value: 1 },
      });
    }
  };

  const handleSkipFlexibleQuota = (item: FlexibleHabitPeriodItem) => {
    skipHabitMutation.mutate({
      id: item.habitId,
      payload: {
        date: selectedDate,
        skipCount: 1,
        reason: "Abono de cota semanal/mensal",
      },
    });
  };

  // Resolve effective linked habits for a To-Do card
  const getEffectiveLinkedHabitsForTodo = (todo: TodoItem): string[] => {
    const titles = new Set<string>(todo.effectiveLinkedHabitTitles || []);
    if (todo.linkedHabitTitle) titles.add(todo.linkedHabitTitle);
    if (todo.linkedHabitId) {
      const direct = habits.find((h) => h.id === todo.linkedHabitId);
      if (direct) titles.add(direct.title);
    }
    if (todo.categoryId) {
      habits
        .filter(
          (h) =>
            h.isActive &&
            h.completionMode === "TODO_LINKED" &&
            h.linkedTodoCategoryId === todo.categoryId
        )
        .forEach((h) => titles.add(h.title));
    }
    return Array.from(titles);
  };

  const handleAddInlineSubtask = async (todoId: string) => {
    const text = (inlineSubtaskInputs[todoId] || "").trim();
    if (!text) return;
    await addSubtaskMutation.mutateAsync({ todoId, title: text });
    setInlineSubtaskInputs((prev) => ({ ...prev, [todoId]: "" }));
  };

  const handleCreateCategoryInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await createCategoryMutation.mutateAsync({
      name: newCategoryName.trim(),
      colorHex: newCategoryColor,
    });
    setNewCategoryName("");
    setShowCategoryCreator(false);
  };

  // Group habits by schedule type for Tab 3
  const groupedHabits = useMemo(() => {
    return {
      DAILY: habits.filter((h) => h.scheduleType === "DAILY"),
      FIXED_WEEKLY: habits.filter((h) => h.scheduleType === "FIXED_WEEKLY"),
      FLEXIBLE_WEEKLY: habits.filter((h) => h.scheduleType === "FLEXIBLE_WEEKLY"),
      MONTHLY: habits.filter(
        (h) =>
          h.scheduleType === "FIXED_MONTHLY" ||
          h.scheduleType === "FLEXIBLE_MONTHLY"
      ),
    };
  }, [habits]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-health-primary/10 text-health-primary shadow-sm">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Rotina, Hábitos & To-Do List
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestão híbrida de hábitos fixos e flexíveis por cota, tarefas com subtarefas e analytics Esperado vs. Alcançado.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncHealthMutation.mutate(selectedDate)}
            disabled={syncHealthMutation.isPending}
            className="h-9 text-xs border-border"
            title="Reconciliar treinos, passos e pesagens do Health Service com seus hábitos automáticos"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 text-health-primary ${
                syncHealthMutation.isPending ? "animate-spin" : ""
              }`}
            />
            Sincronizar Saúde
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsModalOpen(true)}
            className="h-9 text-xs border-border"
          >
            <Settings2 className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            Ciclo Semanal
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingTodo(null);
              setTodoModalOpen(true);
            }}
            className="h-9 text-xs border-border"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            Nova Tarefa
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingHabit(null);
              setHabitModalOpen(true);
            }}
            className="h-9 text-xs bg-health-primary hover:bg-health-dark text-white shadow-sm"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Novo Hábito
          </Button>
        </div>
      </div>

      {/* Main 4 Internal Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="today">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <TabsList className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto h-auto sm:h-10 p-1 gap-1">
            <TabsTrigger value="today" className="text-xs sm:text-sm gap-1.5">
              <CalendarCheck className="h-4 w-4 text-health-primary" />
              <span>Hoje (Visão do Dia)</span>
            </TabsTrigger>
            <TabsTrigger value="todos" className="text-xs sm:text-sm gap-1.5">
              <ListTodo className="h-4 w-4 text-amber-500" />
              <span>To-Do List</span>
            </TabsTrigger>
            <TabsTrigger value="habits" className="text-xs sm:text-sm gap-1.5">
              <Flame className="h-4 w-4 text-indigo-500" />
              <span>Meus Hábitos</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm gap-1.5">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <span>Gráficos & Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Date navigator when on "Hoje" tab */}
          {activeTab === "today" && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(shiftDateIso(selectedDate, -1))}
                className="h-8 w-8 p-0"
                title="Dia anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value || todayIso)
                }
                className="h-8 w-36 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(shiftDateIso(selectedDate, 1))}
                className="h-8 w-8 p-0"
                title="Próximo dia"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {selectedDate !== todayIso && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(todayIso)}
                  className="h-8 text-xs text-health-primary"
                >
                  Hoje
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ============================================================
            TAB 1: HOJE (VISÃO DO DIA)
           ============================================================ */}
        <TabsContent value="today" className="space-y-6">
          <RoutineDailyGauges
            gauge={dailyView?.dailyGauge}
            flexibleHabits={dailyView?.flexibleHabitsInPeriod}
            weekWindow={dailyView?.weekWindow}
            urgentTodosCount={dailyView?.urgentAndTodayTodos?.length ?? 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Fixed Habits Today */}
            <Card className="border-border shadow-sm flex flex-col">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-health-primary" />
                    <CardTitle className="text-base font-bold">
                      Hábitos Fixos do Dia
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {dailyView?.fixedHabitsToday?.length ?? 0} hoje
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compromissos programados para {formatDateBR(selectedDate)}
                </p>
              </CardHeader>

              <CardContent className="p-4 space-y-3 flex-1">
                {dailyLoading ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    Carregando hábitos do dia...
                  </p>
                ) : (dailyView?.fixedHabitsToday?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Nenhum hábito fixo agendado para este dia.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingHabit(null);
                        setHabitModalOpen(true);
                      }}
                      className="text-xs h-8"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Criar Hábito
                    </Button>
                  </div>
                ) : (
                  dailyView!.fixedHabitsToday.map((item) => {
                    const isCompleted =
                      item.statusToday === "COMPLETED" ||
                      item.progressPercentage >= 100;
                    const isSkipped =
                      item.statusToday === "SKIPPED" || item.isSkippedToday;
                    const isQuantitative =
                      item.completionMode === "QUANTITATIVE";
                    const stepSmall =
                      item.dailyTargetValue >= 1000
                        ? 250
                        : item.dailyTargetValue >= 100
                        ? 25
                        : 1;
                    const stepLarge =
                      item.dailyTargetValue >= 1000
                        ? 500
                        : item.dailyTargetValue >= 100
                        ? 50
                        : 5;

                    return (
                      <div
                        key={item.habitId}
                        className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
                          isCompleted
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : isSkipped
                            ? "border-amber-500/30 bg-muted/40 opacity-75"
                            : "border-border bg-card hover:border-health-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <button
                              type="button"
                              disabled={isSkipped}
                              onClick={() => handleToggleFixedHabit(item)}
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                                isCompleted
                                  ? "bg-health-primary border-health-primary text-white shadow-sm"
                                  : "border-border bg-background hover:border-health-primary"
                              }`}
                              title={
                                isCompleted
                                  ? "Desfazer conclusão"
                                  : "Concluir hábito hoje"
                              }
                            >
                              {isCompleted && <Check className="h-4 w-4" />}
                            </button>

                            <div className="min-w-0">
                              <h4
                                className={`text-sm font-semibold truncate ${
                                  isCompleted
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {item.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {item.currentStreak > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-transparent"
                                  >
                                    🔥 {item.currentStreak}d
                                  </Badge>
                                )}
                                {item.completionMode === "HEALTH_AUTO" && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-emerald-500/30 text-emerald-500"
                                  >
                                    ⚡ Auto Saúde
                                  </Badge>
                                )}
                                {item.completionMode === "TODO_LINKED" && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-indigo-500/30 text-indigo-500"
                                  >
                                    🔗 To-Do
                                  </Badge>
                                )}
                                {isSkipped && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-amber-500/40 text-amber-500"
                                  >
                                    Pulado / Descanso
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSkipToggleFixed(item)}
                            className="text-[11px] text-muted-foreground hover:text-amber-500 flex items-center gap-1 shrink-0"
                            title={
                              isSkipped
                                ? "Remover status de pulo"
                                : "Pular dia sem quebrar a ofensiva (Streak)"
                            }
                          >
                            <PauseCircle className="h-3.5 w-3.5" />
                            <span>{isSkipped ? "Reativar" : "Pular"}</span>
                          </button>
                        </div>

                        {/* Quantitative Incremental Bar & Quick Buttons */}
                        {isQuantitative && !isSkipped && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-mono">
                                {item.currentValueToday} / {item.dailyTargetValue}{" "}
                                {item.unit || ""}
                              </span>
                              <span className="font-bold text-foreground">
                                {Math.min(
                                  100,
                                  Math.round(item.progressPercentage)
                                )}
                                %
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-sky-500 transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, item.progressPercentage)
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleIncrementQuantitative(item, stepSmall)
                                }
                                className="h-7 px-2 text-[11px]"
                              >
                                +{stepSmall} {item.unit || ""}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleIncrementQuantitative(item, stepLarge)
                                }
                                className="h-7 px-2 text-[11px]"
                              >
                                +{stepLarge} {item.unit || ""}
                              </Button>
                              {item.currentValueToday > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    uncheckHabitMutation.mutate({
                                      id: item.habitId,
                                      date: selectedDate,
                                    })
                                  }
                                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive ml-auto"
                                >
                                  Zerar
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Column 2: Flexible Habits in Period (Weekly / Monthly Quotas) */}
            <Card className="border-border shadow-sm flex flex-col">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    <CardTitle className="text-base font-bold">
                      Rotinas Flexíveis (Semana & Mês)
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {dailyView?.flexibleHabitsInPeriod?.length ?? 0} ativas
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cotas sem dia fixo — execute quando preferir dentro do ciclo
                </p>
              </CardHeader>

              <CardContent className="p-4 space-y-3 flex-1">
                {dailyLoading ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    Carregando cotas flexíveis...
                  </p>
                ) : (dailyView?.flexibleHabitsInPeriod?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Nenhum hábito flexível por cota configurado (ex: 3x na semana ou 2 tarefas/mês).
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingHabit(null);
                        setHabitModalOpen(true);
                      }}
                      className="text-xs h-8"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Criar Hábito Flexível
                    </Button>
                  </div>
                ) : (
                  dailyView!.flexibleHabitsInPeriod.map((item) => {
                    const target = Math.max(1, item.periodTargetCount || 1);
                    const achieved = item.periodAchievedCount || 0;
                    const isGoalMet =
                      item.isPeriodGoalMet || achieved >= target;
                    const isOverachieved =
                      item.isOverachieved || achieved > target;

                    return (
                      <div
                        key={item.habitId}
                        className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
                          isGoalMet
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : "border-border bg-card hover:border-indigo-500/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: item.colorHex || "#6366F1",
                                }}
                              />
                              <h4 className="text-sm font-semibold text-foreground truncate">
                                {item.title}
                              </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px]">
                                {item.scheduleType === "FLEXIBLE_MONTHLY"
                                  ? `Mês (${item.periodLabel})`
                                  : "Semana Atual"}
                              </Badge>

                              {item.linkedTodoCategoryName && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                                >
                                  🔗 To-Do: {item.linkedTodoCategoryName}
                                </Badge>
                              )}

                              {item.completionMode === "HEALTH_AUTO" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-emerald-500/30 text-emerald-500"
                                >
                                  ⚡ Health Connect
                                </Badge>
                              )}

                              {item.currentStreak > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                >
                                  🔥 {item.currentStreak}{" "}
                                  {item.streakUnit === "MONTHS"
                                    ? "mês(es)"
                                    : "sem"}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isOverachieved ? (
                              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px]">
                                <Trophy className="mr-1 h-3 w-3" />
                                {achieved}/{target} Superação!
                              </Badge>
                            ) : isGoalMet ? (
                              <Badge variant="health" className="text-[11px]">
                                {achieved}/{target} Sucesso!
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[11px] font-mono">
                                {achieved} / {target}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Visual Quota Pills (● ● ○) */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {Array.from({
                              length: Math.min(12, Math.max(target, achieved)),
                            }).map((_, idx) => {
                              const isExtra = idx >= target;
                              const isFilled = idx < achieved;
                              return (
                                <span
                                  key={idx}
                                  className={`h-3 w-3 rounded-full transition-all ${
                                    isExtra
                                      ? "bg-amber-400 ring-2 ring-amber-400/30"
                                      : isFilled
                                      ? "bg-emerald-500"
                                      : "bg-muted border border-border"
                                  }`}
                                  title={
                                    isExtra
                                      ? "Execução extra (Superação)"
                                      : isFilled
                                      ? "Cota cumprida"
                                      : "Cota pendente"
                                  }
                                />
                              );
                            })}
                            <span className="text-[11px] text-muted-foreground ml-1">
                              {achieved}/{target} no ciclo
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSkipFlexibleQuota(item)}
                              className="rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-amber-500"
                              title="Abonar 1 unidade da cota neste período"
                            >
                              Abonar
                            </button>
                            <Button
                              type="button"
                              size="sm"
                              variant={item.executedToday ? "outline" : "default"}
                              onClick={() => handleToggleFlexibleToday(item)}
                              className={`h-7 px-2.5 text-[11px] ${
                                item.executedToday
                                  ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                              }`}
                            >
                              {item.executedToday
                                ? "✓ Feito Hoje"
                                : "+ Executar Hoje"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Column 3: Urgent & Today To-Dos */}
            <Card className="border-border shadow-sm flex flex-col">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base font-bold">
                      To-Dos de Hoje & Urgentes
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTodo(null);
                      setTodoModalOpen(true);
                    }}
                    className="h-7 px-2 text-xs text-health-primary"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Concluir uma tarefa vinculada avança seu hábito em tempo real
                </p>
              </CardHeader>

              <CardContent className="p-4 space-y-3 flex-1">
                {(dailyView?.urgentAndTodayTodos?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Nenhuma tarefa urgente ou vencendo hoje!
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("todos")}
                      className="text-xs h-8"
                    >
                      Ver To-Do List Completa
                    </Button>
                  </div>
                ) : (
                  dailyView!.urgentAndTodayTodos.map((todo) => {
                    const isDone = todo.status === "COMPLETED";
                    const linkedTitles = getEffectiveLinkedHabitsForTodo(todo);
                    const pBadge =
                      PRIORITY_BADGE[todo.priority] || PRIORITY_BADGE.MEDIUM;

                    return (
                      <div
                        key={todo.id}
                        className="rounded-xl border border-border bg-card p-3.5 space-y-2 hover:border-amber-500/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => toggleTodoMutation.mutate(todo.id)}
                            className="flex items-start gap-2.5 text-left min-w-0 flex-1"
                          >
                            {isDone ? (
                              <CheckSquare className="h-5 w-5 text-health-primary shrink-0 mt-0.5" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground hover:text-health-primary shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-semibold ${
                                  isDone
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {todo.title}
                              </p>

                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${pBadge.className}`}
                                >
                                  {pBadge.label}
                                </Badge>

                                {todo.categoryName && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {todo.categoryName}
                                  </Badge>
                                )}

                                {todo.dueDate && (
                                  <span className="text-[11px] text-muted-foreground">
                                    Vence: {formatDateBR(todo.dueDate)}
                                  </span>
                                )}

                                {(todo.subtasksTotal ?? 0) > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-mono"
                                  >
                                    Checklist: {todo.subtasksCompleted}/
                                    {todo.subtasksTotal}
                                  </Badge>
                                )}
                              </div>

                              {linkedTitles.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                  {linkedTitles.map((ht, i) => (
                                    <Badge
                                      key={i}
                                      className="text-[10px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30"
                                    >
                                      <Link2 className="mr-1 h-2.5 w-2.5" />
                                      Avança: {ht}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTodo(todo);
                              setTodoModalOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 2: TO-DO LIST COMPLETA
           ============================================================ */}
        <TabsContent value="todos" className="space-y-6">
          {/* Category Chips & Filter Controls */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTodoCategoryFilter("ALL")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      todoCategoryFilter === "ALL"
                        ? "bg-health-primary text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Todas as Categorias
                  </button>

                  {categories.map((cat) => {
                    const active = todoCategoryFilter === cat.id;
                    return (
                      <div
                        key={cat.id}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          active
                            ? "border-foreground bg-card text-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setTodoCategoryFilter(cat.id)}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.colorHex || "#6366F1" }}
                          />
                          <span>{cat.name}</span>
                        </button>
                        {active && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Excluir a categoria "${cat.name}"? As tarefas continuarão salvas sem categoria.`
                                )
                              ) {
                                deleteCategoryMutation.mutate(cat.id);
                                setTodoCategoryFilter("ALL");
                              }
                            }}
                            className="ml-2 text-muted-foreground hover:text-destructive"
                            title="Excluir categoria"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowCategoryCreator(!showCategoryCreator)}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-health-primary hover:text-health-primary transition-colors"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    <span>+ Categoria</span>
                  </button>
                </div>

                {/* Status & Priority Selectors */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
                    {(
                      [
                        { key: "PENDING", label: "Pendentes" },
                        { key: "COMPLETED", label: "Concluídas" },
                        { key: "ALL", label: "Todas" },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setTodoStatusFilter(st.key)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                          todoStatusFilter === st.key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <select
                    value={todoPriorityFilter}
                    onChange={(e) =>
                      setTodoPriorityFilter(
                        e.target.value as TodoPriority | "ALL"
                      )
                    }
                    className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs"
                  >
                    <option value="ALL">Qualquer Prioridade</option>
                    <option value="URGENT">Urgente</option>
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Média</option>
                    <option value="LOW">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Inline Category Creator */}
              {showCategoryCreator && (
                <form
                  onSubmit={handleCreateCategoryInline}
                  className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60"
                >
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da nova categoria (ex: Casa, Finanças, Estudos)..."
                    className="h-8 text-xs max-w-xs"
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="h-8 w-8 rounded border border-border bg-transparent cursor-pointer"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createCategoryMutation.isPending}
                    className="h-8 text-xs bg-health-primary text-white"
                  >
                    Criar Categoria
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCategoryCreator(false)}
                    className="h-8 text-xs"
                  >
                    Cancelar
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* To-Do Items List */}
          <div className="space-y-3">
            {todosLoading ? (
              <Card className="border-border p-8 text-center text-xs text-muted-foreground">
                Carregando tarefas...
              </Card>
            ) : todos.length === 0 ? (
              <Card className="border-border p-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Nenhuma tarefa encontrada para os filtros selecionados.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTodo(null);
                    setTodoModalOpen(true);
                  }}
                  className="bg-health-primary text-white text-xs"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Criar Primeira Tarefa
                </Button>
              </Card>
            ) : (
              todos.map((todo) => {
                const isDone = todo.status === "COMPLETED";
                const pBadge =
                  PRIORITY_BADGE[todo.priority] || PRIORITY_BADGE.MEDIUM;
                const linkedHabitTitles = getEffectiveLinkedHabitsForTodo(todo);
                const isExpanded = Boolean(expandedTodoIds[todo.id]);
                const subtasks = todo.subtasks || [];

                return (
                  <Card
                    key={todo.id}
                    className={`border-border shadow-sm transition-all ${
                      isDone ? "bg-muted/30 opacity-85" : "bg-card"
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleTodoMutation.mutate(todo.id)}
                            className="mt-0.5 shrink-0"
                            title={
                              isDone
                                ? "Reabrir tarefa (estorna automaticamente +1 do hábito vinculado)"
                                : "Concluir tarefa (credita +1 no hábito vinculado)"
                            }
                          >
                            {isDone ? (
                              <CheckSquare className="h-5 w-5 text-health-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground hover:text-health-primary" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className={`text-sm font-bold ${
                                  isDone
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {todo.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${pBadge.className}`}
                              >
                                {pBadge.label}
                              </Badge>
                              {todo.categoryName && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {todo.categoryName}
                                </Badge>
                              )}
                              {todo.dueDate && (
                                <Badge variant="outline" className="text-[10px]">
                                  📅 {formatDateBR(todo.dueDate)}
                                </Badge>
                              )}
                            </div>

                            {todo.description && (
                              <p className="text-xs text-muted-foreground">
                                {todo.description}
                              </p>
                            )}

                            {/* Effective Linked Habits Badges */}
                            {linkedHabitTitles.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {linkedHabitTitles.map((titleStr, idx) => (
                                  <Badge
                                    key={idx}
                                    className="text-[10px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30"
                                  >
                                    <Link2 className="mr-1 h-3 w-3" />
                                    Hábito vinculado: {titleStr}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions & Expand Subtasks Button */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedTodoIds((prev) => ({
                                ...prev,
                                [todo.id]: !prev[todo.id],
                              }))
                            }
                            className="h-8 px-2.5 text-xs gap-1"
                          >
                            <span>
                              Subtarefas ({todo.subtasksCompleted ?? 0}/
                              {todo.subtasksTotal ?? subtasks.length})
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTodo(todo);
                              setTodoModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Editar tarefa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Deseja excluir a tarefa "${todo.title}"?`
                                )
                              ) {
                                deleteTodoMutation.mutate(todo.id);
                              }
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            title="Excluir tarefa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expandable Subtasks Checklist */}
                      {isExpanded && (
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2 mt-2">
                          <div className="space-y-1.5">
                            {subtasks.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Nenhuma subtarefa cadastrada neste item.
                              </p>
                            ) : (
                              subtasks.map((st) => (
                                <div
                                  key={st.id}
                                  className="flex items-center justify-between rounded-lg bg-background px-2.5 py-1.5 text-xs border border-border/50"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleSubtaskMutation.mutate({
                                        todoId: todo.id,
                                        subtaskId: st.id,
                                      })
                                    }
                                    className="flex items-center gap-2 text-left flex-1"
                                  >
                                    {st.isCompleted ? (
                                      <CheckSquare className="h-3.5 w-3.5 text-health-primary shrink-0" />
                                    ) : (
                                      <Square className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    )}
                                    <span
                                      className={
                                        st.isCompleted
                                          ? "line-through text-muted-foreground"
                                          : "text-foreground"
                                      }
                                    >
                                      {st.title}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteSubtaskMutation.mutate({
                                        todoId: todo.id,
                                        subtaskId: st.id,
                                      })
                                    }
                                    className="text-muted-foreground hover:text-destructive p-1"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Input
                              value={inlineSubtaskInputs[todo.id] || ""}
                              onChange={(e) =>
                                setInlineSubtaskInputs((prev) => ({
                                  ...prev,
                                  [todo.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddInlineSubtask(todo.id);
                                }
                              }}
                              placeholder="Nova subtarefa no checklist..."
                              className="h-8 text-xs"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddInlineSubtask(todo.id)}
                              className="h-8 text-xs shrink-0"
                            >
                              + Subtarefa
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 3: MEUS HÁBITOS (CATÁLOGO & CONFIGURAÇÃO)
           ============================================================ */}
        <TabsContent value="habits" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground">
                Catálogo de Hábitos & Regras de Frequência
              </h3>
              <p className="text-xs text-muted-foreground">
                Início da semana configurado para:{" "}
                <strong className="text-foreground">
                  {DAY_SHORT_MAP[routineSettings?.weekStartDay || "MONDAY"] ||
                    routineSettings?.weekStartDay ||
                    "Segunda-feira"}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer mr-2">
                <input
                  type="checkbox"
                  checked={showArchivedHabits}
                  onChange={(e) => setShowArchivedHabits(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                Mostrar arquivados
              </label>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsModalOpen(true)}
                className="h-8 text-xs"
              >
                <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                Início da Semana
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setEditingHabit(null);
                  setHabitModalOpen(true);
                }}
                className="h-8 text-xs bg-health-primary text-white"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Novo Hábito
              </Button>
            </div>
          </div>

          {habitsLoading ? (
            <Card className="border-border p-8 text-center text-xs text-muted-foreground">
              Carregando catálogo de hábitos...
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  {
                    key: "DAILY",
                    title: "Hábitos Diários",
                    subtitle: "Esperados todos os dias da semana",
                    list: groupedHabits.DAILY,
                  },
                  {
                    key: "FIXED_WEEKLY",
                    title: "Semanais Fixos",
                    subtitle: "Dias específicos da semana (ex: Seg, Qua, Sex)",
                    list: groupedHabits.FIXED_WEEKLY,
                  },
                  {
                    key: "FLEXIBLE_WEEKLY",
                    title: "Semanais Flexíveis (Por Cota)",
                    subtitle: "Meta de N vezes na semana sem dia fixo",
                    list: groupedHabits.FLEXIBLE_WEEKLY,
                  },
                  {
                    key: "MONTHLY",
                    title: "Mensais (Fixos & Flexíveis)",
                    subtitle: "Metas mensais e hábitos integrados à To-Do List",
                    list: groupedHabits.MONTHLY,
                  },
                ] as const
              ).map((group) => (
                <Card key={group.key} className="border-border shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">
                          {group.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {group.subtitle}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {group.list.length}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    {group.list.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        Nenhum hábito neste grupo.
                      </p>
                    ) : (
                      group.list.map((h) => (
                        <div
                          key={h.id}
                          className={`rounded-xl border p-3.5 space-y-2 transition-all ${
                            !h.isActive
                              ? "border-border/50 bg-muted/40 opacity-70"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-3 w-3 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: h.colorHex || "#10B981",
                                  }}
                                />
                                <h4 className="text-sm font-bold text-foreground truncate">
                                  {h.title}
                                </h4>
                                {!h.isActive && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Arquivado
                                  </Badge>
                                )}
                              </div>

                              {h.description && (
                                <p className="text-xs text-muted-foreground">
                                  {h.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {h.scheduleType === "FIXED_WEEKLY" &&
                                  h.daysOfWeek && (
                                    <Badge variant="outline" className="text-[10px]">
                                      {h.daysOfWeek
                                        .map((d) => DAY_SHORT_MAP[d] || d)
                                        .join(", ")}
                                    </Badge>
                                  )}

                                {(h.scheduleType === "FLEXIBLE_WEEKLY" ||
                                  h.scheduleType === "FLEXIBLE_MONTHLY") && (
                                  <Badge variant="outline" className="text-[10px]">
                                    Cota: {h.targetCountPerPeriod}x /{" "}
                                    {h.scheduleType === "FLEXIBLE_WEEKLY"
                                      ? "semana"
                                      : "mês"}
                                  </Badge>
                                )}

                                {h.completionMode === "QUANTITATIVE" && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Meta: {h.dailyTargetValue} {h.unit || ""}
                                  </Badge>
                                )}

                                {h.completionMode === "TODO_LINKED" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-indigo-500/15 text-indigo-500"
                                  >
                                    🔗 Vínculo To-Do
                                  </Badge>
                                )}

                                {h.completionMode === "HEALTH_AUTO" && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-emerald-500/40 text-emerald-500"
                                  >
                                    ⚡ Auto Saúde ({h.healthTriggerType})
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingHabit(h);
                                  setHabitModalOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Editar hábito"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  archiveHabitMutation.mutate({
                                    id: h.id,
                                    archive: h.isActive,
                                  })
                                }
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-500"
                                title={
                                  h.isActive
                                    ? "Arquivar hábito"
                                    : "Reativar hábito"
                                }
                              >
                                {h.isActive ? (
                                  <Archive className="h-4 w-4" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Excluir permanentemente o hábito "${h.title}" e todo seu histórico?`
                                    )
                                  ) {
                                    deleteHabitMutation.mutate(h.id);
                                  }
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Excluir hábito"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Streaks Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                              <Flame className="h-3.5 w-3.5" />
                              Ofensiva Atual: {h.currentStreak ?? 0}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Trophy className="h-3.5 w-3.5 text-indigo-400" />
                              Recorde: {h.bestStreak ?? 0}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ============================================================
            TAB 4: GRÁFICOS & ANALYTICS (ESPERADO VS. ALCANÇADO)
           ============================================================ */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Period & Date Navigation Bar */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl border border-border bg-muted/60 p-1">
                  <button
                    type="button"
                    onClick={() => setAnalyticsPeriod("WEEK")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      analyticsPeriod === "WEEK"
                        ? "bg-health-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Visão Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsPeriod("MONTH")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      analyticsPeriod === "MONTH"
                        ? "bg-health-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Visão Mensal
                  </button>
                </div>

                {comparisonData && (
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    Período: {formatDateBR(comparisonData.startDate)} até{" "}
                    {formatDateBR(comparisonData.endDate)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAnalyticsRefDate(
                      shiftDateIso(
                        analyticsRefDate,
                        analyticsPeriod === "WEEK" ? -7 : -30
                      )
                    )
                  }
                  className="h-8 px-2.5 text-xs"
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Anterior
                </Button>

                <Input
                  type="date"
                  value={analyticsRefDate}
                  onChange={(e) =>
                    setAnalyticsRefDate(e.target.value || todayIso)
                  }
                  className="h-8 w-36 text-xs"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAnalyticsRefDate(
                      shiftDateIso(
                        analyticsRefDate,
                        analyticsPeriod === "WEEK" ? 7 : 30
                      )
                    )
                  }
                  className="h-8 px-2.5 text-xs"
                >
                  Próximo
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chart 1 & 2: Double Bar Chart + Horizontal Breakdown */}
          <ExpectedVsAchievedChart
            data={comparisonData}
            isLoading={comparisonLoading}
          />

          {/* Chart 3 & 4: Consistency Heatmap + Trend Area Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <HabitHeatmap
              heatmap={heatmapData}
              habits={habits}
              selectedMonths={heatmapMonths}
              onSelectMonths={setHeatmapMonths}
              selectedHabitId={heatmapHabitId}
              onSelectHabitId={setHeatmapHabitId}
              isLoading={heatmapLoading}
            />

            <ConsistencyTrendChart
              series={comparisonData?.trendLineSeries}
              periodType={analyticsPeriod}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <HabitModal
        open={habitModalOpen}
        onOpenChange={setHabitModalOpen}
        initialHabit={editingHabit}
        categories={categories}
      />

      <TodoModal
        open={todoModalOpen}
        onOpenChange={setTodoModalOpen}
        initialTodo={editingTodo}
        categories={categories}
        habits={habits}
      />

      <SettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        settings={routineSettings}
      />
    </div>
  );
}
