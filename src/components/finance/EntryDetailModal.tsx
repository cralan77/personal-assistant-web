"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinancialEntry } from "@/types";
import { financeService } from "@/lib/api/services";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  CreditCard,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

interface EntryDetailModalProps {
  entry: FinancialEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface EditFormValues {
  name: string;
  value: number;
  dueDate: string;
}

export function EntryDetailModal({
  entry,
  open,
  onOpenChange,
  onSuccess,
}: EntryDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<EditFormValues>();

  useEffect(() => {
    if (entry) {
      setValue("name", entry.name);
      setValue("value", entry.amount);
      setValue("dueDate", entry.dueDate || new Date().toISOString().split("T")[0]);
      setIsEditing(false);
      setErrorMessage(null);
    }
  }, [entry, setValue]);

  if (!entry) return null;

  const isIncome = entry.type === "INCOME";

  // Mark as Paid / Confirmed
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      if (isIncome) {
        await financeService.confirmIncome(entry.id);
      } else {
        await financeService.confirmBill(entry.id, paymentMethod);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Erro ao liquidar conta:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Não foi possível confirmar o pagamento."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Edit entry
  const handleSaveEdit = async (values: EditFormValues) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      if (isIncome) {
        await financeService.updateIncome(entry.id, {
          name: values.name,
          value: Number(values.value),
          dueDate: values.dueDate,
        });
      } else {
        await financeService.updateBill(entry.id, {
          name: values.name,
          value: Number(values.value),
          dueDate: values.dueDate,
        });
      }
      onSuccess();
      setIsEditing(false);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Erro ao atualizar lançamento:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Não foi possível atualizar o lançamento."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete entry
  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir "${entry.name}"?`)) {
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      if (isIncome) {
        await financeService.deleteIncome(entry.id);
      } else {
        await financeService.deleteBill(entry.id);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Erro ao excluir lançamento:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Não foi possível excluir o lançamento."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center space-x-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isIncome
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {isIncome ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {entry.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isIncome ? "Receita / Provento" : "Despesa / Conta a Pagar"}
              </DialogDescription>
            </div>
          </div>

          <div>
            {entry.isPaid ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Liquidado
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="mr-1 h-3.5 w-3.5" />
                Pendente
              </span>
            )}
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="flex items-center rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive my-2">
          <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mode 1: Viewing Details and Quick Actions */}
      {!isEditing ? (
        <div className="space-y-4 py-2">
          {/* Summary Box */}
          <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Valor:</span>
              <span
                className={`text-xl font-bold font-mono ${
                  isIncome ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {isIncome ? "+" : "-"} {formatCurrencyBRL(entry.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Vencimento:</span>
              <span className="font-semibold text-foreground">
                {formatDateBR(entry.dueDate)}
              </span>
            </div>
            {entry.paymentDate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Data de Quitação:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatDateBR(entry.paymentDate)}
                </span>
              </div>
            )}
            {entry.categoryName && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Categoria:</span>
                <span className="font-medium text-foreground">
                  {entry.categoryName}
                </span>
              </div>
            )}
          </div>

          {/* Action: Pay / Liquidate if pending */}
          {!entry.isPaid && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                {isIncome ? "Confirmar Recebimento" : "Liquidar / Pagar Conta"}
              </h4>

              {!isIncome && (
                <div className="space-y-1">
                  <Label htmlFor="paymentMethod" className="text-xs">
                    Método de Pagamento
                  </Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="WALLET">Carteira / Saldo Bancário</option>
                    <option value="PIX">PIX (Débito em Carteira)</option>
                    <option value="DEBIT">Cartão de Débito (Débito em Carteira)</option>
                    <option value="CASH">Dinheiro em Espécie</option>
                  </select>
                </div>
              )}

              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold shadow-sm"
              >
                {isProcessing
                  ? "Processando..."
                  : isIncome
                  ? "Confirmar Entrada do Valor"
                  : "Marcar Conta como Paga"}
              </Button>
            </div>
          )}

          {/* Edit / Delete Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex-1 text-xs h-9"
              disabled={isProcessing}
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" />
              Editar Lançamento
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="text-xs h-9 px-3"
              disabled={isProcessing}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Excluir
            </Button>
          </div>
        </div>
      ) : (
        /* Mode 2: Editing Entry */
        <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="editName" className="text-xs">
              Descrição
            </Label>
            <Input
              id="editName"
              {...register("name", { required: true })}
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="editValue" className="text-xs">
                Valor (R$)
              </Label>
              <Input
                id="editValue"
                type="number"
                step="0.01"
                {...register("value", { required: true })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="editDueDate" className="text-xs">
                Vencimento
              </Label>
              <Input
                id="editDueDate"
                type="date"
                {...register("dueDate", { required: true })}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={isProcessing}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-health-primary hover:bg-health-dark text-white text-xs"
              disabled={isProcessing}
            >
              {isProcessing ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}
