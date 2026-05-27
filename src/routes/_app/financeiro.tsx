import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, brl } from "@/components/ui-bits";
import { KPIS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Financeiro" subtitle="Visão geral · contas, fluxo, receitas e despesas" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Saldo de Caixa" value={brl(KPIS.saldoCaixa)} accent="gold" />
        <StatCard label="A Receber" value={brl(KPIS.contasReceber)} accent="success" />
        <StatCard label="A Pagar" value={brl(KPIS.contasPagarVencendo)} accent="danger" />
        <StatCard label="Despesas Mês" value={brl(KPIS.despesasMes)} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Use as abas laterais para Contas a Pagar, a Receber, Fluxo de Caixa e DRE.</p>
    </>
  ),
});
