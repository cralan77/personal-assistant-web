import { apiClient } from "./client";
import {
  CheckHabitPayload,
  CreateHabitPayload,
  CreateTodoCategoryPayload,
  CreateTodoPayload,
  DailyRoutineView,
  DayOfWeek,
  Habit,
  HabitHeatmapData,
  HabitHeatmapDay,
  RoutineAnalyticsComparison,
  RoutineSummary,
  SkipHabitPayload,
  TodoCategory,
  TodoItem,
  TodoPriority,
  TodoStatus,
  TodoSubtask,
  UpdateHabitPayload,
  UpdateTodoPayload,
  UserRoutineSettings,
} from "@/types";

function normalizeHabit(raw: any): Habit {
  let daysOfWeek: DayOfWeek[] | null = null;
  if (Array.isArray(raw.daysOfWeek)) {
    daysOfWeek = raw.daysOfWeek as DayOfWeek[];
  } else if (typeof raw.daysOfWeek === "string" && raw.daysOfWeek.trim()) {
    daysOfWeek = raw.daysOfWeek
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean) as DayOfWeek[];
  }

  let daysOfMonth: number[] | null = null;
  if (Array.isArray(raw.daysOfMonth)) {
    daysOfMonth = raw.daysOfMonth.map((n: any) => Number(n)).filter((n: number) => !isNaN(n));
  } else if (typeof raw.daysOfMonth === "string" && raw.daysOfMonth.trim()) {
    daysOfMonth = raw.daysOfMonth
      .split(",")
      .map((s: string) => Number(s.trim()))
      .filter((n: number) => !isNaN(n));
  }

  return {
    ...raw,
    id: raw.id || raw.habitId,
    colorHex: raw.colorHex || "#10B981",
    icon: raw.icon || "check-circle",
    daysOfWeek,
    daysOfMonth,
    targetCountPerPeriod: Number(raw.targetCountPerPeriod ?? 1),
    dailyTargetValue: Number(raw.dailyTargetValue ?? 1),
    quotaCountMode: raw.quotaCountMode || "DAYS_COMPLETED",
    completionMode: raw.completionMode || "CHECK",
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : !raw.archivedAt,
    currentStreak: Number(raw.currentStreak ?? 0),
    bestStreak: Number(raw.bestStreak ?? 0),
  };
}

function normalizeTodo(raw: any): TodoItem {
  const subtasks: TodoSubtask[] = Array.isArray(raw.subtasks)
    ? raw.subtasks.map((st: any) => ({
        id: st.id,
        todoId: st.todoId || raw.id,
        title: st.title,
        isCompleted: Boolean(st.isCompleted ?? st.completed),
        sortOrder: st.sortOrder ?? 0,
        completedAt: st.completedAt || null,
        createdAt: st.createdAt,
      }))
    : [];

  const subtasksTotal =
    raw.subtasksTotal !== undefined ? Number(raw.subtasksTotal) : subtasks.length;
  const subtasksCompleted =
    raw.subtasksCompleted !== undefined
      ? Number(raw.subtasksCompleted)
      : subtasks.filter((s) => s.isCompleted).length;

  return {
    ...raw,
    priority: raw.priority || "MEDIUM",
    status: raw.status || "PENDING",
    effectiveLinkedHabitTitles: Array.isArray(raw.effectiveLinkedHabitTitles)
      ? raw.effectiveLinkedHabitTitles
      : raw.linkedHabitTitle
      ? [raw.linkedHabitTitle]
      : [],
    subtasks,
    subtasksTotal,
    subtasksCompleted,
  };
}

// ==========================================
// Habits API
// ==========================================

export async function getHabits(includeArchived: boolean = false): Promise<Habit[]> {
  const { data } = await apiClient.get<any[]>(
    `/api/proxy/habits?includeArchived=${includeArchived}`
  );
  return (data || []).map(normalizeHabit);
}

export async function getHabitById(id: string): Promise<Habit> {
  const { data } = await apiClient.get<any>(`/api/proxy/habits/${id}`);
  return normalizeHabit(data);
}

export async function createHabit(payload: CreateHabitPayload): Promise<Habit> {
  const { data } = await apiClient.post<any>("/api/proxy/habits", payload);
  return normalizeHabit(data);
}

export async function updateHabit(
  id: string,
  payload: UpdateHabitPayload
): Promise<Habit> {
  const { data } = await apiClient.put<any>(`/api/proxy/habits/${id}`, payload);
  return normalizeHabit(data);
}

export async function archiveHabit(
  id: string,
  archive: boolean = true
): Promise<Habit> {
  const { data } = await apiClient.patch<any>(`/api/proxy/habits/${id}/archive`, {
    archived: archive,
    isActive: !archive,
  });
  return normalizeHabit(data);
}

export async function deleteHabit(id: string): Promise<void> {
  await apiClient.delete(`/api/proxy/habits/${id}`);
}

export async function checkHabit(
  id: string,
  payload?: CheckHabitPayload
): Promise<any> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await apiClient.post(`/api/proxy/habits/${id}/check`, {
    date: payload?.date || today,
    value: payload?.value ?? 1.0,
    notes: payload?.notes,
  });
  return data;
}

export async function uncheckHabit(id: string, date?: string): Promise<void> {
  const targetDate = date || new Date().toISOString().split("T")[0];
  await apiClient.delete(`/api/proxy/habits/${id}/check?date=${targetDate}`);
}

export async function skipHabit(
  id: string,
  payload?: SkipHabitPayload
): Promise<any> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await apiClient.post(`/api/proxy/habits/${id}/skip`, {
    date: payload?.date || today,
    skipCount: payload?.skipCount ?? 1,
    reason: payload?.reason || "Descanso / Justificado",
  });
  return data;
}

export async function unskipHabit(id: string, date?: string): Promise<void> {
  const targetDate = date || new Date().toISOString().split("T")[0];
  await apiClient.delete(`/api/proxy/habits/${id}/skip?date=${targetDate}`);
}

export async function syncHealthHabits(date?: string): Promise<any> {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const { data } = await apiClient.post(
    `/api/proxy/habits/sync-health?date=${targetDate}`,
    { date: targetDate }
  );
  return data;
}

// ==========================================
// To-Do Categories API
// ==========================================

export async function getTodoCategories(): Promise<TodoCategory[]> {
  const { data } = await apiClient.get<TodoCategory[]>(
    "/api/proxy/todo-categories"
  );
  return data || [];
}

export async function createTodoCategory(
  payload: CreateTodoCategoryPayload
): Promise<TodoCategory> {
  const { data } = await apiClient.post<TodoCategory>(
    "/api/proxy/todo-categories",
    {
      name: payload.name,
      colorHex: payload.colorHex || "#6366F1",
      icon: payload.icon || "folder",
    }
  );
  return data;
}

export async function updateTodoCategory(
  id: string,
  payload: Partial<CreateTodoCategoryPayload>
): Promise<TodoCategory> {
  const { data } = await apiClient.put<TodoCategory>(
    `/api/proxy/todo-categories/${id}`,
    payload
  );
  return data;
}

export async function deleteTodoCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/proxy/todo-categories/${id}`);
}

// ==========================================
// To-Do Items & Subtasks API
// ==========================================

export interface GetTodosFilter {
  status?: TodoStatus | "ALL";
  categoryId?: string;
  priority?: TodoPriority | "ALL";
}

export async function getTodos(filters?: GetTodosFilter): Promise<TodoItem[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.categoryId && filters.categoryId !== "ALL") {
    params.set("categoryId", filters.categoryId);
  }
  if (filters?.priority && filters.priority !== "ALL") {
    params.set("priority", filters.priority);
  }
  const queryString = params.toString();
  const url = `/api/proxy/todos${queryString ? `?${queryString}` : ""}`;
  const { data } = await apiClient.get<any[]>(url);
  return (data || []).map(normalizeTodo);
}

export async function createTodo(payload: CreateTodoPayload): Promise<TodoItem> {
  const normalizedSubtasks = payload.subtasks?.map((st) =>
    typeof st === "string" ? { title: st } : st
  );
  const { data } = await apiClient.post<any>("/api/proxy/todos", {
    ...payload,
    subtasks: normalizedSubtasks,
  });
  return normalizeTodo(data);
}

export async function updateTodo(
  id: string,
  payload: UpdateTodoPayload
): Promise<TodoItem> {
  const { data } = await apiClient.put<any>(`/api/proxy/todos/${id}`, payload);
  return normalizeTodo(data);
}

export async function toggleTodo(id: string): Promise<TodoItem> {
  const { data } = await apiClient.patch<any>(`/api/proxy/todos/${id}/toggle`);
  return normalizeTodo(data);
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(`/api/proxy/todos/${id}`);
}

export async function addSubtask(
  todoId: string,
  title: string
): Promise<TodoSubtask> {
  const { data } = await apiClient.post<any>(
    `/api/proxy/todos/${todoId}/subtasks`,
    { title }
  );
  return {
    id: data.id,
    todoId: data.todoId || todoId,
    title: data.title,
    isCompleted: Boolean(data.isCompleted ?? data.completed),
    sortOrder: data.sortOrder ?? 0,
    completedAt: data.completedAt || null,
    createdAt: data.createdAt,
  };
}

export async function toggleSubtask(
  todoId: string,
  subtaskId: string
): Promise<TodoSubtask> {
  const { data } = await apiClient.patch<any>(
    `/api/proxy/todos/${todoId}/subtasks/${subtaskId}/toggle`
  );
  return {
    id: data.id || subtaskId,
    todoId: data.todoId || todoId,
    title: data.title || "",
    isCompleted: Boolean(data.isCompleted ?? data.completed),
    sortOrder: data.sortOrder ?? 0,
    completedAt: data.completedAt || null,
    createdAt: data.createdAt,
  };
}

export async function deleteSubtask(
  todoId: string,
  subtaskId: string
): Promise<void> {
  await apiClient.delete(`/api/proxy/todos/${todoId}/subtasks/${subtaskId}`);
}

// ==========================================
// Routine Views, Analytics & Settings API
// ==========================================

export async function getDailyRoutine(date?: string): Promise<DailyRoutineView> {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const { data } = await apiClient.get<any>(
    `/api/proxy/routines/daily?date=${targetDate}`
  );
  return {
    date: data.date || targetDate,
    dayOfWeek: data.dayOfWeek || "MONDAY",
    weekWindow: data.weekWindow || {
      startDate: targetDate,
      endDate: targetDate,
      weekStartDay: "MONDAY",
    },
    dailyGauge: {
      fixedExpectedCount: Number(data.dailyGauge?.fixedExpectedCount ?? 0),
      fixedCompletedCount: Number(data.dailyGauge?.fixedCompletedCount ?? 0),
      fixedSkippedCount: Number(data.dailyGauge?.fixedSkippedCount ?? 0),
      fixedSuccessPercentage: Number(
        data.dailyGauge?.fixedSuccessPercentage ?? 100
      ),
      flexibleCompletedTodayBonus: Number(
        data.dailyGauge?.flexibleCompletedTodayBonus ?? 0
      ),
      weeklyConsistencyPercentage:
        data.dailyGauge?.weeklyConsistencyPercentage !== undefined
          ? Number(data.dailyGauge.weeklyConsistencyPercentage)
          : undefined,
    },
    fixedHabitsToday: Array.isArray(data.fixedHabitsToday)
      ? data.fixedHabitsToday
      : [],
    flexibleHabitsInPeriod: Array.isArray(data.flexibleHabitsInPeriod)
      ? data.flexibleHabitsInPeriod
      : [],
    urgentAndTodayTodos: Array.isArray(data.urgentAndTodayTodos)
      ? data.urgentAndTodayTodos.map(normalizeTodo)
      : [],
  };
}

export async function getAnalyticsComparison(
  period: "WEEK" | "MONTH" = "WEEK",
  referenceDate?: string
): Promise<RoutineAnalyticsComparison> {
  const targetDate = referenceDate || new Date().toISOString().split("T")[0];
  const { data } = await apiClient.get<RoutineAnalyticsComparison>(
    `/api/proxy/routines/analytics/comparison?period=${period}&referenceDate=${targetDate}`
  );
  return data;
}

export async function getHabitHeatmap(
  months: number = 3,
  habitId?: string
): Promise<HabitHeatmapData> {
  const params = new URLSearchParams({ months: String(months) });
  if (habitId && habitId !== "ALL") {
    params.set("habitId", habitId);
  }
  const { data } = await apiClient.get<any>(
    `/api/proxy/routines/analytics/heatmap?${params.toString()}`
  );

  const rawDays: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.days)
    ? data.days
    : Array.isArray(data?.entries)
    ? data.entries
    : [];

  const days: HabitHeatmapDay[] = rawDays.map((d) => ({
    date: d.date,
    completedCount: Number(d.completedCount ?? d.achievedCount ?? d.count ?? 0),
    expectedCount: Number(d.expectedCount ?? 1),
    percentage: Number(d.percentage ?? 0),
    intensity: Number(d.intensity ?? 0),
  }));

  return {
    months: Number(data?.months ?? months),
    habitId: data?.habitId ?? habitId ?? null,
    habitTitle: data?.habitTitle ?? null,
    startDate: data?.startDate ?? (days[0]?.date || ""),
    endDate: data?.endDate ?? (days[days.length - 1]?.date || ""),
    totalCompletedDays:
      data?.totalCompletedDays ??
      days.filter((d) => d.intensity > 0 || d.completedCount > 0).length,
    currentStreak: data?.currentStreak,
    bestStreak: data?.bestStreak,
    days,
  };
}

export async function getRoutineSummary(): Promise<RoutineSummary> {
  const { data } = await apiClient.get<any>("/api/proxy/routines/summary");
  return {
    date: data?.date || new Date().toISOString().split("T")[0],
    fixedExpectedToday: Number(
      data?.fixedExpectedToday ?? data?.fixedExpectedCount ?? 0
    ),
    fixedCompletedToday: Number(
      data?.fixedCompletedToday ?? data?.fixedCompletedCount ?? 0
    ),
    fixedSkippedToday: Number(
      data?.fixedSkippedToday ?? data?.fixedSkippedCount ?? 0
    ),
    fixedSuccessPercentageToday: Number(
      data?.fixedSuccessPercentageToday ?? data?.fixedSuccessPercentage ?? 0
    ),
    flexibleCompletedTodayBonus: Number(data?.flexibleCompletedTodayBonus ?? 0),
    flexibleHabitsInPeriodCount: Number(data?.flexibleHabitsInPeriodCount ?? 0),
    flexibleHabitsCompletedInPeriodCount: Number(
      data?.flexibleHabitsCompletedInPeriodCount ?? 0
    ),
    weeklyConsistencyPercentage: Number(
      data?.weeklyConsistencyPercentage ?? data?.consistencyPercentage ?? 0
    ),
    pendingTodosTodayCount: Number(
      data?.pendingTodosTodayCount ?? data?.pendingTodosCount ?? 0
    ),
    overdueTodosCount: Number(data?.overdueTodosCount ?? 0),
    urgentTodosCount: Number(data?.urgentTodosCount ?? 0),
    topStreakHabitTitle: data?.topStreakHabitTitle ?? null,
    topStreakCount: Number(data?.topStreakCount ?? 0),
    pendingFixedHabitTitles: Array.isArray(data?.pendingFixedHabitTitles)
      ? data.pendingFixedHabitTitles
      : [],
    urgentTodoTitles: Array.isArray(data?.urgentTodoTitles)
      ? data.urgentTodoTitles
      : [],
  };
}

export async function getRoutineSettings(): Promise<UserRoutineSettings> {
  const { data } = await apiClient.get<UserRoutineSettings>(
    "/api/proxy/routines/settings"
  );
  return {
    userId: data?.userId,
    weekStartDay: data?.weekStartDay || "MONDAY",
    timezone: data?.timezone || "America/Sao_Paulo",
    eveningReminderEnabled:
      data?.eveningReminderEnabled !== undefined
        ? Boolean(data.eveningReminderEnabled)
        : true,
    eveningReminderTime: data?.eveningReminderTime || "20:00",
    updatedAt: data?.updatedAt,
  };
}

export async function updateRoutineSettings(
  payload: Partial<UserRoutineSettings>
): Promise<UserRoutineSettings> {
  const { data } = await apiClient.put<UserRoutineSettings>(
    "/api/proxy/routines/settings",
    payload
  );
  return data;
}

export const routinesService = {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  archiveHabit,
  deleteHabit,
  checkHabit,
  uncheckHabit,
  skipHabit,
  unskipHabit,
  syncHealthHabits,
  getTodoCategories,
  createTodoCategory,
  updateTodoCategory,
  deleteTodoCategory,
  getTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  getDailyRoutine,
  getAnalyticsComparison,
  getHabitHeatmap,
  getRoutineSummary,
  getRoutineSettings,
  updateRoutineSettings,
};
