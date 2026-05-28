import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, brl } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateDre, cashFlowProjection } from "@/lib/domain";
import { downloadCsv } from "@/lib/export";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/contador")({
  head: () => ({ meta: [{ title: "Painel do Contador - L'Chef Cafe" }] }),
  component: ContadorPage,
});

function ContadorPage() {
  const { state } = useBusiness();
  const dre = calculateDre(state);
  const flow = cashFlowProjection(state);
  const expenses = state.financialRecords.filter(
    (record) => record.type === "expense" && record.status !== "canceled",
  );

  const exportAccounting = () => {
    downloadCsv("lchef-contador.csv", [
      ...state.orders.map((order) => ({
        tipo: "venda",
        data: order.createdAt.slice(0, 10),
        descricao: order.id,
        valor: order.total,
        status: order.status,
      })),
      ...state.financialRecords.map((record) => ({
        tipo: record.type,
        data: record.competenceDate,
        descricao: record.description,
        valor: record.amount,
        status: record.status,
      })),
    ]);
  };

  return (
    <>
      <PageHeader
        title="Painel do Contador"
        subtitle="Visao objetiva de vendas, documentos, DRE e exportacoes"
        actions={
          <Button className="bg-[color:var(--primary)]" onClick={exportAccounting}>
            Exportar CSV
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Receita liquida" value={brl(dre.netRevenue)} accent="success" />
        <StatCard
          label="Despesas"
          value={brl(expenses.reduce((sum, item) => sum + item.amount, 0))}
          accent="danger"
        />
        <StatCard label="Impostos" value={brl(dre.taxes)} />
        <StatCard label="Resultado" value={brl(dre.operatingProfit)} accent="gold" />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Documentos disponiveis</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            {[
              `Relatorio de vendas: ${state.orders.length} pedidos`,
              `Receitas por categoria: ${state.financialRecords.filter((record) => record.type === "revenue").length} lancamentos`,
              `Despesas por categoria: ${expenses.length} lancamentos`,
              `DRE gerencial: ${brl(dre.operatingProfit)} resultado`,
              `Fluxo de caixa: ${flow.length} linhas`,
              `Compras: ${state.purchases.length} compras`,
              `Fornecedores: ${state.suppliers.length} fornecedores`,
              `Movimentacoes de caixa: ${state.cashRegisters.reduce((sum, cash) => sum + cash.movements.length, 0)} registros`,
            ].map((document) => (
              <li
                key={document}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <span>{document}</span>
                <Button size="sm" variant="ghost" onClick={exportAccounting}>
                  CSV
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
