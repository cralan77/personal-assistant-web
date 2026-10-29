"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { financeService } from "@/lib/api/services";
import { FinancialSummaryCards } from "@/components/finance/FinancialSummaryCards";
import { EntriesTable } from "@/components/finance/EntriesTable";
import { NewEntryModal } from "@/components/finance/NewEntryModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";
import { Wallet as WalletIcon, Plus, CreditCard, ShieldCheck } from "lucide-react";
import { FinancialEntry } from "@/types";

export default function FinancePage() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ["finance-summary-page"],
    queryFn: () => financeService.getSummary(),
  });

  const { data: entries = [], refetch: refetchEntries } = useQuery({
    queryKey: ["finance-entries"],
    queryFn: () => financeService.listEntries(),
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ["wallets-list"],
    queryFn: () => financeService.listWallets(),
  });

  const handleSuccess = (newEntry: FinancialEntry) => {
    refetchSummary();
    refetchEntries();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <WalletIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Gestão Financeira & Lançamentos
            </h2>
            <p className="text-sm text-muted-foreground">
              Controle de contas a pagar, receitas, carteiras e conciliação bancária.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-health-primary hover:bg-health-dark text-white text-xs h-10 px-4 shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* Summary Cards */}
      <FinancialSummaryCards summary={summary} />

      {/* Wallets Row */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Suas Carteiras</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.length === 0 ? (
            <Card className="col-span-full border-border p-6 text-center text-sm text-muted-foreground">
              Nenhuma carteira cadastrada no momento.
            </Card>
          ) : (
            wallets.map((wallet) => (
            <Card key={wallet.id} className="border-border shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {wallet.name}
                    </h4>
                    <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{wallet.status === "ACTIVE" ? "Ativa" : "Inativa"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base font-bold text-foreground font-mono">
                    {formatCurrencyBRL(wallet.currentBalance)}
                  </p>
                  {wallet.overdraftLimit > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Limite: {formatCurrencyBRL(wallet.overdraftLimit)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )))}
        </div>
      </div>

      {/* Entries Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Histórico de Lançamentos</h3>
        <EntriesTable entries={entries} onRefresh={() => { refetchEntries(); refetchSummary(); }} />
      </div>

      {/* Modal New Entry */}
      <NewEntryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
