import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/fichas-tecnicas")({
  head: () => ({ meta: [{ title: "Fichas Técnicas · L'Chef Café" }] }),
  component: Fichas,
});

const FICHA = {
  produto: "Brownie Bean-to-Bar",
  rendimento: "20 unidades",
  custoTotal: 102.0,
  custoUn: 5.1,
  preco: 18.0,
  margem: 71.7,
  cmv: 28.3,
  preparo: "45 min",
  validade: "5 dias refrigerado",
  versao: "v2.3",
  ingredientes: [
    { nome: "Chocolate 70%", qtd: 0.4, un: "kg", custo: 72 },
    { nome: "Manteiga", qtd: 0.25, un: "kg", custo: 12.5 },
    { nome: "Açúcar", qtd: 0.3, un: "kg", custo: 1.44 },
    { nome: "Farinha de Trigo", qtd: 0.18, un: "kg", custo: 1.12 },
    { nome: "Ovos", qtd: 4, un: "un", custo: 4.0 },
    { nome: "Embalagem individual", qtd: 20, un: "un", custo: 10.94 },
  ],
};

function Fichas() {
  return (
    <>
      <PageHeader title="Fichas Técnicas" subtitle="Receitas, custos, rendimento e CMV calculados automaticamente"
        actions={<Button className="bg-[color:var(--primary)]">+ Nova Ficha</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>{FICHA.produto}</span>
              <Badge variant="outline">{FICHA.versao}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr><th className="py-2">Ingrediente</th><th>Qtd</th><th>Un</th><th className="text-right">Custo</th></tr>
              </thead>
              <tbody className="divide-y">
                {FICHA.ingredientes.map((i, k) => (
                  <tr key={k}>
                    <td className="py-2">{i.nome}</td>
                    <td>{i.qtd}</td>
                    <td>{i.un}</td>
                    <td className="text-right">{brl(i.custo)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="pt-3" colSpan={3}>Custo total da receita</td>
                  <td className="pt-3 text-right text-[color:var(--primary)]">{brl(FICHA.custoTotal)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Rendimento</div><div className="text-xl font-semibold">{FICHA.rendimento}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Custo / un</div><div className="text-xl font-semibold">{brl(FICHA.custoUn)}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Preço venda</div><div className="text-xl font-semibold text-[color:var(--primary)]">{brl(FICHA.preco)}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Margem · CMV</div><div className="text-xl font-semibold text-emerald-600">{FICHA.margem}% · {FICHA.cmv}%</div></CardContent></Card>
          <Card><CardContent className="p-4 text-sm space-y-1"><div><span className="text-muted-foreground">Tempo de preparo:</span> {FICHA.preparo}</div><div><span className="text-muted-foreground">Validade:</span> {FICHA.validade}</div></CardContent></Card>
        </div>
      </div>
    </>
  );
}
