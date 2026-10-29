import { FinancialSummary } from "@/types";
import { formatCurrencyBRL } from "@/lib/utils";
import { MetricQuickCard } from "@/components/home/MetricQuickCard";
import { Wallet, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface FinancialSummaryCardsProps {
  summary?: FinancialSummary | null;
}

export function FinancialSummaryCards({ summary }: FinancialSummaryCardsProps) {
  const balance = summary?.totalBalance ?? 0;
  const income = summary?.totalIncomeMonth ?? 0;
  const expense = summary?.totalExpenseMonth ?? 0;
  const pendingAmount = summary?.pendingBillsAmount ?? 0;
  const pendingCount = summary?.pendingBillsCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Saldo Líquido */}
      <MetricQuickCard
        title="Saldo Consolidado"
        value={formatCurrencyBRL(balance)}
        subtitle="Receitas - Despesas no mês"
        icon={Wallet}
        iconColor={balance >= 0 ? "text-emerald-500" : "text-rose-500"}
        iconBg={balance >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"}
      />

      {/* Receitas */}
      <MetricQuickCard
        title="Receitas do Mês"
        value={formatCurrencyBRL(income)}
        subtitle="Entradas liquidadas"
        icon={TrendingUp}
        iconColor="text-emerald-500"
        iconBg="bg-emerald-500/10"
      />

      {/* Despesas */}
      <MetricQuickCard
        title="Despesas Pagas"
        value={formatCurrencyBRL(expense)}
        subtitle="Saídas confirmadas"
        icon={TrendingDown}
        iconColor="text-rose-500"
        iconBg="bg-rose-500/10"
      />

      {/* Pendências */}
      <MetricQuickCard
        title="Contas a Pagar"
        value={formatCurrencyBRL(pendingAmount)}
        subtitle={`${pendingCount} faturas em aberto`}
        icon={AlertCircle}
        iconColor="text-amber-500"
        iconBg="bg-amber-500/10"
      />
    </div>
  );
}
