import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, FileBarChart, Download } from "lucide-react";

const RELATORIOS = [
  "Vendas por dia", "Vendas por mês", "Vendas por produto", "Vendas por categoria",
  "Vendas por canal", "Vendas por funcionário", "Ticket médio", "CMV",
  "Margem por produto", "Margem por categoria", "Estoque atual", "Estoque crítico",
  "Validade próxima", "Perdas", "Compras por fornecedor", "Contas a pagar",
  "Contas a receber", "Despesas por categoria", "Receitas por categoria",
  "Fluxo de caixa", "DRE", "Fechamento de caixa", "Relatório p/ contador",
  "Produtos mais vendidos", "Produtos menos vendidos", "Clientes mais valiosos",
];

export const Route = createFileRoute("/_app/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Central de Relatórios" subtitle="Exportação em PDF, CSV e Excel" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {RELATORIOS.map(r => (
          <Card key={r}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FileBarChart className="h-4 w-4 text-[color:var(--gold)]" /> {r}</CardTitle></CardHeader>
            <CardContent className="flex gap-2 pt-0">
              <Button size="sm" variant="outline"><FileText className="mr-1 h-3 w-3" /> PDF</Button>
              <Button size="sm" variant="outline"><FileSpreadsheet className="mr-1 h-3 w-3" /> Excel</Button>
              <Button size="sm" variant="outline"><Download className="mr-1 h-3 w-3" /> CSV</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  ),
});
