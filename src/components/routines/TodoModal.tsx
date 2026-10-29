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
import { Badge } from "@/components/ui/badge";
import {
  Habit,
  TodoCategory,
  TodoItem,
  TodoPriority,
  TodoSubtask,
} from "@/types";
import {
  useAddSubtask,
  useCreateTodo,
  useCreateTodoCategory,
  useDeleteSubtask,
  useToggleSubtask,
  useUpdateTodo,
} from "@/lib/hooks/use-routines";
import {
  AlertCircle,
  CheckSquare,
  Link2,
  Plus,
  Square,
  Trash2,
} from "lucide-react";

interface TodoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTodo?: TodoItem | null;
  categories: TodoCategory[];
  habits: Habit[];
}

export function TodoModal({
  open,
  onOpenChange,
  initialTodo,
  categories,
  habits,
}: TodoModalProps) {
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const createCategoryMutation = useCreateTodoCategory();
  const addSubtaskMutation = useAddSubtask();
  const toggleSubtaskMutation = useToggleSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [linkedHabitId, setLinkedHabitId] = useState<string>("");

  // Subtasks draft for new todo or live list for existing todo
  const [draftSubtasks, setDraftSubtasks] = useState<string[]>([]);
  const [existingSubtasks, setExistingSubtasks] = useState<TodoSubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Inline Category Creation
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366F1");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    setNewSubtaskTitle("");
    setShowNewCat(false);
    if (initialTodo) {
      setTitle(initialTodo.title || "");
      setDescription(initialTodo.description || "");
      setPriority(initialTodo.priority || "MEDIUM");
      setDueDate(
        initialTodo.dueDate ? initialTodo.dueDate.split("T")[0] : ""
      );
      setCategoryId(initialTodo.categoryId || "");
      setLinkedHabitId(initialTodo.linkedHabitId || "");
      setExistingSubtasks(initialTodo.subtasks || []);
      setDraftSubtasks([]);
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate(new Date().toISOString().split("T")[0]);
      setCategoryId("");
      setLinkedHabitId("");
      setExistingSubtasks([]);
      setDraftSubtasks([]);
    }
  }, [initialTodo, open]);

  // Identify habits automatically linked by the selected category
  const autoLinkedHabitsByCategory = habits.filter(
    (h) =>
      h.isActive &&
      h.completionMode === "TODO_LINKED" &&
      categoryId &&
      h.linkedTodoCategoryId === categoryId
  );

  const handleCreateInlineCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const created = await createCategoryMutation.mutateAsync({
        name: newCatName.trim(),
        colorHex: newCatColor,
      });
      setCategoryId(created.id);
      setNewCatName("");
      setShowNewCat(false);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Erro ao criar categoria."
      );
    }
  };

  const handleAddSubtaskClick = async () => {
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;

    if (initialTodo) {
      try {
        const added = await addSubtaskMutation.mutateAsync({
          todoId: initialTodo.id,
          title: trimmed,
        });
        setExistingSubtasks((prev) => [...prev, added]);
        setNewSubtaskTitle("");
      } catch (err: any) {
        setErrorMessage("Não foi possível adicionar a subtarefa.");
      }
    } else {
      setDraftSubtasks((prev) => [...prev, trimmed]);
      setNewSubtaskTitle("");
    }
  };

  const handleToggleExistingSubtask = async (st: TodoSubtask) => {
    if (!initialTodo) return;
    try {
      await toggleSubtaskMutation.mutateAsync({
        todoId: initialTodo.id,
        subtaskId: st.id,
      });
      setExistingSubtasks((prev) =>
        prev.map((item) =>
          item.id === st.id
            ? { ...item, isCompleted: !item.isCompleted }
            : item
        )
      );
    } catch {
      setErrorMessage("Erro ao atualizar subtarefa.");
    }
  };

  const handleDeleteExistingSubtask = async (subtaskId: string) => {
    if (!initialTodo) return;
    try {
      await deleteSubtaskMutation.mutateAsync({
        todoId: initialTodo.id,
        subtaskId,
      });
      setExistingSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
    } catch {
      setErrorMessage("Erro ao remover subtarefa.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Informe o título da tarefa.");
      return;
    }

    try {
      if (initialTodo) {
        await updateTodoMutation.mutateAsync({
          id: initialTodo.id,
          payload: {
            title: title.trim(),
            description: description.trim() || null,
            priority,
            dueDate: dueDate || null,
            categoryId: categoryId || null,
            linkedHabitId: linkedHabitId || null,
          },
        });
      } else {
        await createTodoMutation.mutateAsync({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          dueDate: dueDate || null,
          categoryId: categoryId || null,
          linkedHabitId: linkedHabitId || null,
          subtasks: draftSubtasks.map((t) => ({ title: t })),
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Não foi possível salvar a tarefa."
      );
    }
  };

  const isSaving =
    createTodoMutation.isPending || updateTodoMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[82vh] overflow-y-auto pr-1">
        <DialogHeader>
          <DialogTitle>
            {initialTodo ? "Editar Tarefa (To-Do)" : "Nova Tarefa (To-Do)"}
          </DialogTitle>
          <DialogDescription>
            Tarefas pontuais com checklist de subtarefas e vínculo híbrido com seus Hábitos.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive mb-3">
            <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="todo-title">Título da Tarefa</Label>
            <Input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Consertar fechadura da varanda, Comprar filtro..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="todo-desc">Notas / Detalhes (Opcional)</Label>
            <Input
              id="todo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Prioridade e Data de Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="todo-priority">Prioridade</Label>
              <select
                id="todo-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TodoPriority)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="LOW">Baixa (LOW)</option>
                <option value="MEDIUM">Média (MEDIUM)</option>
                <option value="HIGH">Alta (HIGH)</option>
                <option value="URGENT">Urgente (URGENT)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="todo-due">Data de Vencimento</Label>
              <Input
                id="todo-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Categoria e Vínculo com Hábito */}
          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="todo-cat" className="text-xs">
                  Categoria da Tarefa
                </Label>
                <button
                  type="button"
                  onClick={() => setShowNewCat(!showNewCat)}
                  className="text-xs font-medium text-health-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Nova Categoria
                </button>
              </div>

              {showNewCat && (
                <div className="flex items-center gap-2 py-1">
                  <Input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Casa, Trabalho, Estudos"
                    className="h-8 text-xs flex-1"
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-8 w-8 rounded border border-border bg-transparent cursor-pointer"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateInlineCategory}
                    disabled={createCategoryMutation.isPending}
                    className="h-8 text-xs bg-health-primary text-white"
                  >
                    Salvar
                  </Button>
                </div>
              )}

              <select
                id="todo-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="">Sem categoria específica</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="todo-habit"
                className="text-xs flex items-center gap-1.5"
              >
                <Link2 className="h-3.5 w-3.5 text-indigo-500" />
                Vínculo Direto com Hábito (Opcional)
              </Label>
              <select
                id="todo-habit"
                value={linkedHabitId}
                onChange={(e) => setLinkedHabitId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="">
                  Nenhum vínculo direto (usar apenas vínculo por categoria)
                </option>
                {habits
                  .filter((h) => h.isActive)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
              </select>

              {autoLinkedHabitsByCategory.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Hábito(s) acionado(s) pela categoria:
                  </span>
                  {autoLinkedHabitsByCategory.map((h) => (
                    <Badge
                      key={h.id}
                      variant="secondary"
                      className="text-[10px] bg-indigo-500/15 text-indigo-500"
                    >
                      🔗 {h.title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checklist de Subtarefas */}
          <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3.5">
            <Label className="text-xs font-semibold">
              Subtarefas / Checklist (Não contabilizam cota do hábito pai)
            </Label>

            <div className="flex items-center gap-2">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtaskClick();
                  }
                }}
                placeholder="Adicionar passo ao checklist..."
                className="h-8 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubtaskClick}
                className="h-8 text-xs shrink-0"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Incluir
              </Button>
            </div>

            {/* List of Subtasks */}
            <div className="space-y-1.5 pt-1">
              {initialTodo
                ? existingSubtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleExistingSubtask(st)}
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
                        onClick={() => handleDeleteExistingSubtask(st.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                : draftSubtasks.map((titleItem, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs"
                    >
                      <span className="text-foreground">• {titleItem}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftSubtasks((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
            </div>
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
                : initialTodo
                ? "Salvar Alterações"
                : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </Dialog>
  );
}
