import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatCard, brl } from "@/components/ui-bits";
import { dashboardMetrics, expectedCashAmount } from "@/lib/domain";
import { useBusiness, useOpenCashRegister } from "@/lib/store";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro - L'Chef Cafe" }] }),
  component: Financeiro,
});

function Financeiro() {
  const { state } = useBusiness();
  const cash = useOpenCashRegister();
  const metrics = dashboardMetrics(state);
  const balance = cash ? expectedCashAmount(cash) : 0;

  return (
    <>
      <PageHeader title="Financeiro" subtitle="Visao geral de contas, fluxo, receitas e despesas" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Caixa aberto" value={cash ? brl(balance) : "Sem caixa"} accent="gold" />
        <StatCard label="A receber" value={brl(metrics.receivableOpen)} accent="success" />
        <StatCard label="A pagar" value={brl(metrics.payableDueSoon)} accent="danger" />
        <StatCard label="Despesas mes" value={brl(metrics.monthExpenses)} />
      </div>
      <Card className="mt-6">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Vendas finalizadas no PDV geram receitas pagas automaticamente. Contas canceladas nao
          entram na DRE. Despesas pagas podem reduzir o caixa quando houver caixa aberto.
        </CardContent>
      </Card>
    </>
  );
}
