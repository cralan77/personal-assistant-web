"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSubtask,
  archiveHabit,
  checkHabit,
  createHabit,
  createTodo,
  createTodoCategory,
  deleteHabit,
  deleteSubtask,
  deleteTodo,
  deleteTodoCategory,
  getAnalyticsComparison,
  getDailyRoutine,
  getHabitHeatmap,
  getHabits,
  getRoutineSettings,
  getRoutineSummary,
  getTodoCategories,
  getTodos,
  GetTodosFilter,
  skipHabit,
  syncHealthHabits,
  toggleSubtask,
  toggleTodo,
  uncheckHabit,
  unskipHabit,
  updateHabit,
  updateRoutineSettings,
  updateTodo,
  updateTodoCategory,
} from "@/lib/api/routines";
import {
  CheckHabitPayload,
  CreateHabitPayload,
  CreateTodoCategoryPayload,
  CreateTodoPayload,
  SkipHabitPayload,
  UpdateHabitPayload,
  UpdateTodoPayload,
  UserRoutineSettings,
} from "@/types";

// ==========================================
// Query Hooks
// ==========================================

export function useHabits(includeArchived: boolean = false) {
  return useQuery({
    queryKey: ["habits", { includeArchived }],
    queryFn: () => getHabits(includeArchived),
  });
}

export function useTodoCategories() {
  return useQuery({
    queryKey: ["todo-categories"],
    queryFn: () => getTodoCategories(),
  });
}

export function useTodos(filters?: GetTodosFilter) {
  return useQuery({
    queryKey: ["todos", filters],
    queryFn: () => getTodos(filters),
  });
}

export function useDailyRoutine(date?: string) {
  const targetDate = date || new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["routines", "daily", targetDate],
    queryFn: () => getDailyRoutine(targetDate),
  });
}

export function useAnalyticsComparison(
  period: "WEEK" | "MONTH" = "WEEK",
  referenceDate?: string
) {
  const targetDate = referenceDate || new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["routines", "analytics", "comparison", period, targetDate],
    queryFn: () => getAnalyticsComparison(period, targetDate),
  });
}

export function useHabitHeatmap(months: number = 3, habitId?: string) {
  return useQuery({
    queryKey: ["routines", "analytics", "heatmap", months, habitId || "ALL"],
    queryFn: () => getHabitHeatmap(months, habitId),
  });
}

export function useRoutineSummary() {
  return useQuery({
    queryKey: ["routines", "summary"],
    queryFn: () => getRoutineSummary(),
  });
}

export function useRoutineSettings() {
  return useQuery({
    queryKey: ["routines", "settings"],
    queryFn: () => getRoutineSettings(),
  });
}

// ==========================================
// Helper for Cross-Domain Cache Invalidation
// ==========================================

function useInvalidateRoutinesDomain() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["habits"] });
    queryClient.invalidateQueries({ queryKey: ["todos"] });
    queryClient.invalidateQueries({ queryKey: ["todo-categories"] });
    queryClient.invalidateQueries({ queryKey: ["routines"] });
  };
}

// ==========================================
// Habit Mutation Hooks
// ==========================================

export function useCreateHabit() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (payload: CreateHabitPayload) => createHabit(payload),
    onSuccess: invalidateAll,
  });
}

export function useUpdateHabit() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHabitPayload }) =>
      updateHabit(id, payload),
    onSuccess: invalidateAll,
  });
}

export function useArchiveHabit() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      archiveHabit(id, archive),
    onSuccess: invalidateAll,
  });
}

export function useDeleteHabit() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: invalidateAll,
  });
}

export function useCheckHabit() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: CheckHabitPayload;
    }) => checkHabit(id, payload),
    onSuccess: invalidateAll,
  });
}

export function useUncheckHabit() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date?: string }) =>
      uncheckHabit(id, date),
    onSuccess: invalidateAll,
  });
}

export function useSkipHabit() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: SkipHabitPayload }) =>
      skipHabit(id, payload),
    onSuccess: invalidateAll,
  });
}

export function useUnskipHabit() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date?: string }) =>
      unskipHabit(id, date),
    onSuccess: invalidateAll,
  });
}

export function useSyncHealthHabits() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (date?: string) => syncHealthHabits(date),
    onSuccess: invalidateAll,
  });
}

// ==========================================
// To-Do Categories Mutation Hooks
// ==========================================

export function useCreateTodoCategory() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (payload: CreateTodoCategoryPayload) =>
      createTodoCategory(payload),
    onSuccess: invalidateAll,
  });
}

export function useUpdateTodoCategory() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateTodoCategoryPayload>;
    }) => updateTodoCategory(id, payload),
    onSuccess: invalidateAll,
  });
}

export function useDeleteTodoCategory() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (id: string) => deleteTodoCategory(id),
    onSuccess: invalidateAll,
  });
}

// ==========================================
// To-Do Items & Subtasks Mutation Hooks
// (With cross-invalidation of Habits & Analytics)
// ==========================================

export function useCreateTodo() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (payload: CreateTodoPayload) => createTodo(payload),
    onSuccess: invalidateAll,
  });
}

export function useUpdateTodo() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTodoPayload }) =>
      updateTodo(id, payload),
    onSuccess: invalidateAll,
  });
}

export function useToggleTodo() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (id: string) => toggleTodo(id),
    onSuccess: invalidateAll,
  });
}

export function useDeleteTodo() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: invalidateAll,
  });
}

export function useAddSubtask() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({ todoId, title }: { todoId: string; title: string }) =>
      addSubtask(todoId, title),
    onSuccess: invalidateAll,
  });
}

export function useToggleSubtask() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({
      todoId,
      subtaskId,
    }: {
      todoId: string;
      subtaskId: string;
    }) => toggleSubtask(todoId, subtaskId),
    onSuccess: invalidateAll,
  });
}

export function useDeleteSubtask() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: ({
      todoId,
      subtaskId,
    }: {
      todoId: string;
      subtaskId: string;
    }) => deleteSubtask(todoId, subtaskId),
    onSuccess: invalidateAll,
  });
}

// ==========================================
// Settings Mutation Hook
// ==========================================

export function useUpdateRoutineSettings() {
  const invalidateAll = useInvalidateRoutinesDomain();
  return useMutation({
    mutationFn: (payload: Partial<UserRoutineSettings>) =>
      updateRoutineSettings(payload),
    onSuccess: invalidateAll,
  });
}
