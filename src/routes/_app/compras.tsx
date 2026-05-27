import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FORNECEDORES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/compras")({
  head: () => ({ meta: [{ title: "Compras · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Compras" subtitle="Pedidos de compra, recebimento e atualização automática de estoque"
        actions={<Button className="bg-[color:var(--primary)]">+ Nova Compra</Button>} />
      <Card><CardContent className="p-4">
        <Table>
          <TableHeader><TableRow>
            <TableHead>NF</TableHead><TableHead>Fornecedor</TableHead><TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead><TableHead>Pagamento</TableHead><TableHead>Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {[
              { nf: "00123", f: "Fazenda Aurora", d: "27/05/2026", v: 1280, p: "Boleto 30d", s: "recebido" },
              { nf: "00876", f: "Laticínios Bela Vista", d: "26/05/2026", v: 740, p: "PIX", s: "pago" },
              { nf: "01234", f: "Cacau Amazônico Ltda", d: "24/05/2026", v: 2150, p: "Boleto 21d", s: "pedido" },
              { nf: "00422", f: "Embalagens Premium", d: "22/05/2026", v: 640, p: "Cartão", s: "pago" },
            ].map(r => (
              <TableRow key={r.nf}>
                <TableCell className="font-mono text-xs">{r.nf}</TableCell>
                <TableCell className="font-medium">{r.f}</TableCell>
                <TableCell>{r.d}</TableCell>
                <TableCell className="text-right font-semibold">{brl(r.v)}</TableCell>
                <TableCell>{r.p}</TableCell>
                <TableCell><Badge variant="secondary">{r.s}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
      <p className="mt-3 text-xs text-muted-foreground">Fornecedores ativos: {FORNECEDORES.length}</p>
    </>
  ),
});
