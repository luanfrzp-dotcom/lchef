import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ESTOQUE } from "@/lib/mock-data";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/estoque")({
  head: () => ({ meta: [{ title: "Estoque · L'Chef Café" }] }),
  component: Estoque,
});

function Estoque() {
  return (
    <>
      <PageHeader title="Estoque" subtitle="Insumos, produtos acabados, lotes, validades e movimentações"
        actions={<><Button variant="outline">Inventário</Button><Button className="bg-[color:var(--primary)]">+ Entrada</Button></>} />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        {[
          { l: "Itens cadastrados", v: "184" },
          { l: "Estoque crítico", v: "6", c: "text-red-600" },
          { l: "Validade próxima", v: "4", c: "text-amber-600" },
          { l: "Valor em estoque", v: brl(28430.5), c: "text-[color:var(--gold)]" },
        ].map(s => (
          <Card key={s.l}><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">{s.l}</div><div className={`text-xl font-semibold ${s.c ?? ""}`}>{s.v}</div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Mín</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ESTOQUE.map((e, i) => {
                const critico = e.qtd < e.min;
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{e.item}</TableCell>
                    <TableCell><Badge variant="secondary">{e.categoria}</Badge></TableCell>
                    <TableCell className="text-right">{e.qtd} {e.un}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{e.min} {e.un}</TableCell>
                    <TableCell className="text-right">{brl(e.custo)}</TableCell>
                    <TableCell>{e.validade}</TableCell>
                    <TableCell>
                      {critico
                        ? <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="mr-1 h-3 w-3" /> crítico</Badge>
                        : <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">ok</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
