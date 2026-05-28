import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, Download } from "lucide-react";
import { calculateDre, cashFlowProjection } from "@/lib/domain";
import { downloadCsv, type CsvRow } from "@/lib/export";
import { useBusiness } from "@/lib/store";

type Report = {
  name: string;
  rows: () => CsvRow[];
};

export const Route = createFileRoute("/_app/relatorios")({
  head: () => ({ meta: [{ title: "Relatorios - L'Chef Cafe" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { state } = useBusiness();
  const reports: Report[] = [
    {
      name: "Vendas por periodo",
      rows: () =>
        state.orders.map((order) => ({
          data: order.createdAt.slice(0, 10),
          pedido: order.id,
          cliente: order.customerName,
          canal: order.channel,
          total: order.total,
          status: order.status,
        })),
    },
    {
      name: "Vendas por produto",
      rows: () =>
        state.orders.flatMap((order) =>
          order.items.map((item) => ({
            data: order.createdAt.slice(0, 10),
            pedido: order.id,
            produto: item.name,
            quantidade: item.quantity,
            total: item.unitPrice * item.quantity,
          })),
        ),
    },
    {
      name: "Estoque atual",
      rows: () =>
        state.inventoryItems.map((item) => ({
          insumo: item.name,
          categoria: item.category,
          quantidade: item.quantity,
          unidade: item.unit,
          minimo: item.minQuantity,
          lote: item.lot,
          validade: item.expiresAt,
        })),
    },
    {
      name: "Compras por fornecedor",
      rows: () =>
        state.purchases.map((purchase) => ({
          nf: purchase.invoiceNumber,
          fornecedor: purchase.supplierName,
          data: purchase.createdAt.slice(0, 10),
          total: purchase.total,
          status: purchase.status,
        })),
    },
    {
      name: "Contas a pagar",
      rows: () =>
        state.financialRecords
          .filter((record) => record.type === "expense")
          .map((record) => ({
            descricao: record.description,
            categoria: record.category,
            vencimento: record.dueDate,
            valor: record.amount,
            status: record.status,
          })),
    },
    {
      name: "Contas a receber",
      rows: () =>
        state.financialRecords
          .filter((record) => record.type === "revenue")
          .map((record) => ({
            descricao: record.description,
            categoria: record.category,
            vencimento: record.dueDate,
            valor: record.amount,
            status: record.status,
          })),
    },
    {
      name: "DRE",
      rows: () => {
        const dre = calculateDre(state);
        return Object.entries(dre).map(([linha, valor]) => ({ linha, valor }));
      },
    },
    {
      name: "Fluxo de caixa",
      rows: () => cashFlowProjection(state),
    },
  ];

  return (
    <>
      <PageHeader
        title="Central de Relatorios"
        subtitle="Exportacao operacional em CSV com dados reais do sistema"
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.name}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileBarChart className="h-4 w-4 text-[color:var(--gold)]" /> {report.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 pt-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  downloadCsv(report.name.toLowerCase().replaceAll(" ", "-"), report.rows())
                }
              >
                <Download className="mr-1 h-3 w-3" /> CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
