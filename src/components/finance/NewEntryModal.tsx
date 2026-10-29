"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { financeService } from "@/lib/api/services";
import { EntryType, FinancialEntry } from "@/types";
import { AlertCircle } from "lucide-react";

interface NewEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newEntry: FinancialEntry) => void;
}

interface FormValues {
  type: EntryType;
  name: string;
  value: number;
  dueDate: string;
  walletId?: string;
  subCategoryId?: string;
}

export function NewEntryModal({
  open,
  onOpenChange,
  onSuccess,
}: NewEntryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: wallets = [] } = useQuery({
    queryKey: ["wallets-list"],
    queryFn: () => financeService.listWallets(),
    enabled: open,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-list"],
    queryFn: () => financeService.listCategories(),
    enabled: open,
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ["sub-categories-list"],
    queryFn: () => financeService.listSubCategories(),
    enabled: open,
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      type: "BILL",
      name: "",
      value: 0,
      dueDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedType = watch("type");

  // Filter categories matching the selected type (BILL or INCOME)
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  useEffect(() => {
    if (wallets.length > 0) {
      setValue("walletId", wallets[0].id);
    }
  }, [wallets, setValue]);

  useEffect(() => {
    if (subCategories.length > 0) {
      setValue("subCategoryId", subCategories[0].id);
    }
  }, [subCategories, setValue]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // 1. Resolve or auto-provision Wallet
      let resolvedWalletId = values.walletId;
      if (!resolvedWalletId || resolvedWalletId === "") {
        if (wallets.length > 0) {
          resolvedWalletId = wallets[0].id;
        } else {
          const newWallet = await financeService.createWallet({
            name: "Carteira Principal",
            overdraftLimit: 1000,
          });
          resolvedWalletId = newWallet.id;
          queryClient.invalidateQueries({ queryKey: ["wallets-list"] });
        }
      }

      // 2. Resolve or auto-provision Category & SubCategory
      let resolvedSubCategoryId = values.subCategoryId;
      if (!resolvedSubCategoryId || resolvedSubCategoryId === "") {
        if (subCategories.length > 0) {
          resolvedSubCategoryId = subCategories[0].id;
        } else {
          // Find or create parent category
          let parentCat = filteredCategories.find((c) => c.name.toLowerCase() === "geral");
          if (!parentCat) {
            parentCat = await financeService.createCategory("Geral", values.type);
            queryClient.invalidateQueries({ queryKey: ["categories-list"] });
          }
          const newSub = await financeService.createSubCategory("Outros", parentCat.id);
          resolvedSubCategoryId = newSub.id;
          queryClient.invalidateQueries({ queryKey: ["sub-categories-list"] });
        }
      }

      let created: FinancialEntry;
      if (values.type === "BILL") {
        created = await financeService.createBill({
          name: values.name,
          value: Number(values.value),
          dueDate: values.dueDate,
          walletId: resolvedWalletId,
          subCategoryId: resolvedSubCategoryId,
        });
      } else {
        created = await financeService.createIncome({
          name: values.name,
          value: Number(values.value),
          dueDate: values.dueDate,
          walletId: resolvedWalletId,
          subCategoryId: resolvedSubCategoryId,
        });
      }

      onSuccess(created);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Erro ao cadastrar lançamento:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Não foi possível salvar o lançamento. Verifique os dados informados."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
        <DialogDescription>
          Cadastre uma nova receita ou despesa na sua conta Habitus.
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="flex items-center rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive mb-3">
          <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="type">Tipo de Lançamento</Label>
          <select
            id="type"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            {...register("type")}
          >
            <option value="BILL">Despesa / Conta a Pagar</option>
            <option value="INCOME">Receita / Provento a Receber</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="name">Descrição / Nome</Label>
          <Input
            id="name"
            placeholder="Ex: Mensalidade Academia, Supermercado..."
            {...register("name", { required: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("value", { required: true })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate", { required: true })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Wallet selection */}
          <div className="space-y-1">
            <Label htmlFor="walletId">Carteira / Conta</Label>
            <select
              id="walletId"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              {...register("walletId")}
            >
              {wallets.length === 0 ? (
                <option value="">Carteira Principal (Padrão)</option>
              ) : (
                wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Subcategory selection */}
          <div className="space-y-1">
            <Label htmlFor="subCategoryId">Categoria</Label>
            <select
              id="subCategoryId"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              {...register("subCategoryId")}
            >
              {subCategories.length === 0 ? (
                <option value="">Geral / Outros (Padrão)</option>
              ) : (
                subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

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
            {isSubmitting ? "Cadastrando..." : "Confirmar Lançamento"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
