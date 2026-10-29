"use client";

import { useState } from "react";
import { FinancialEntry } from "@/types";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EntryDetailModal } from "./EntryDetailModal";

interface EntriesTableProps {
  entries: FinancialEntry[];
  onRefresh?: () => void;
}

export function EntriesTable({ entries, onRefresh }: EntriesTableProps) {
  const [filterType, setFilterType] = useState<"ALL" | "BILL" | "INCOME" | "PENDING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<FinancialEntry | null>(null);

  const filtered = entries.filter((entry) => {
    // Search filter
    if (
      searchQuery.trim() &&
      !entry.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(entry.categoryName && entry.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }

    // Type filter
    if (filterType === "BILL") return entry.type === "BILL";
    if (filterType === "INCOME") return entry.type === "INCOME";
    if (filterType === "PENDING") return entry.type === "BILL" && !entry.isPaid;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filterType === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({entries.length})
          </button>
          <button
            onClick={() => setFilterType("INCOME")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filterType === "INCOME"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Receitas
          </button>
          <button
            onClick={() => setFilterType("BILL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filterType === "BILL"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Despesas
          </button>
          <button
            onClick={() => setFilterType("PENDING")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filterType === "PENDING"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            A Pagar
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Nenhum lançamento encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => {
                const isIncome = entry.type === "INCOME";
                return (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="transition-colors hover:bg-muted/50 cursor-pointer group"
                    title="Clique para liquidar, pagar, editar ou excluir este lançamento"
                  >
                    <td className="px-4 py-3.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isIncome
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-foreground group-hover:text-health-primary transition-colors">
                        {entry.name}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {entry.categoryName || (isIncome ? "Renda" : "Geral")}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {formatDateBR(entry.dueDate)}
                    </td>

                    <td
                      className={`px-4 py-3.5 text-right font-mono font-bold ${
                        isIncome ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatCurrencyBRL(entry.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {entry.isPaid ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Liquidado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="mr-1 h-3 w-3" />
                          Pendente
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Opções do lançamento"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Entry Detail & Actions Modal */}
      <EntryDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
        onSuccess={() => {
          onRefresh?.();
          setSelectedEntry(null);
        }}
      />
    </div>
  );
}
