import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, brl } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPIS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/contador")({
  head: () => ({ meta: [{ title: "Painel do Contador · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Painel do Contador" subtitle="Visão objetiva · documentos, DRE e exportações"
        actions={<><Button variant="outline">CSV</Button><Button variant="outline">Excel</Button><Button className="bg-[color:var(--primary)]">PDF</Button></>} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Receita do Mês" value={brl(KPIS.faturamentoMes)} accent="success" />
        <StatCard label="Despesas do Mês" value={brl(KPIS.despesasMes)} accent="danger" />
        <StatCard label="Impostos Estimados" value={brl(6280)} />
        <StatCard label="Resultado" value={brl(18009.8)} accent="gold" />
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">Documentos disponíveis</CardTitle></CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            {["Relatório de vendas por período","Receitas por categoria","Despesas por categoria","Notas fiscais anexadas","Comprovantes de pagamento","DRE gerencial","Fluxo de caixa","Movimentações de caixa","Compras","Fornecedores","Folha de pagamento","Extrato financeiro"].map(d => (
              <li key={d} className="flex items-center justify-between rounded-md border p-2">
                <span>{d}</span><Button size="sm" variant="ghost">Baixar</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  ),
});
