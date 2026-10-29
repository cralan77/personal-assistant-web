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
import { UserRoutineSettings, WeekStartDay } from "@/types";
import { useUpdateRoutineSettings } from "@/lib/hooks/use-routines";
import { AlertCircle, Bell, Calendar, Globe } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: UserRoutineSettings;
}

const WEEK_START_OPTIONS: { value: WeekStartDay; label: string }[] = [
  { value: "MONDAY", label: "Segunda-feira (Padrão ISO-8601)" },
  { value: "SUNDAY", label: "Domingo" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
];

export function SettingsModal({
  open,
  onOpenChange,
  settings,
}: SettingsModalProps) {
  const updateSettingsMutation = useUpdateRoutineSettings();

  const [weekStartDay, setWeekStartDay] = useState<WeekStartDay>("MONDAY");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [eveningReminderEnabled, setEveningReminderEnabled] = useState(true);
  const [eveningReminderTime, setEveningReminderTime] = useState("20:00");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    if (settings) {
      setWeekStartDay(settings.weekStartDay || "MONDAY");
      setTimezone(settings.timezone || "America/Sao_Paulo");
      setEveningReminderEnabled(
        settings.eveningReminderEnabled !== undefined
          ? settings.eveningReminderEnabled
          : true
      );
      setEveningReminderTime(settings.eveningReminderTime || "20:00");
    }
  }, [settings, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await updateSettingsMutation.mutateAsync({
        weekStartDay,
        timezone,
        eveningReminderEnabled,
        eveningReminderTime,
      });
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Não foi possível atualizar as preferências."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Preferências de Rotina & Ciclos</DialogTitle>
        <DialogDescription>
          Configure o dia de início da semana para o cálculo de cotas semanais flexíveis e alertas noturnos da Aurora AI.
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
          <Label className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-health-primary" />
            Dia de Início da Semana
          </Label>
          <select
            value={weekStartDay}
            onChange={(e) => setWeekStartDay(e.target.value as WeekStartDay)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {WEEK_START_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            Define a janela de 7 dias para hábitos Semanais Flexíveis (ex: 3x na semana) e gráficos semanais.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-indigo-500" />
            Fuso Horário (Timezone)
          </Label>
          <Input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="America/Sao_Paulo"
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Lembrete Proativo Noturno (Telegram / Aurora)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Envia resumo às 20h se houver hábitos fixos ou cotas pendentes
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={eveningReminderEnabled}
              onChange={(e) => setEveningReminderEnabled(e.target.checked)}
              className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {eveningReminderEnabled && (
            <div className="space-y-1">
              <Label htmlFor="reminder-time" className="text-xs">
                Horário do Lembrete
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={eveningReminderTime}
                onChange={(e) => setEveningReminderTime(e.target.value)}
                className="h-9 w-36"
              />
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
            disabled={updateSettingsMutation.isPending}
            className="bg-health-primary hover:bg-health-dark text-white"
          >
            {updateSettingsMutation.isPending
              ? "Salvando..."
              : "Salvar Preferências"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
