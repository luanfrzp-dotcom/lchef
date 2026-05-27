import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTAS_PAGAR } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/contas-pagar")({
  head: () => ({ meta: [{ title: "Contas a Pagar · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Contas a Pagar" actions={<Button className="bg-[color:var(--primary)]">+ Nova Conta</Button>} />
      <Card><CardContent className="p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {CONTAS_PAGAR.map((c, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{c.desc}</TableCell>
                <TableCell>{new Date(c.venc).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right font-semibold">{brl(c.valor)}</TableCell>
                <TableCell>{c.status === "vencida" ? <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Vencida</Badge> : <Badge variant="outline">A vencer</Badge>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
