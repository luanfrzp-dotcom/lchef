import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTAS_RECEBER } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/contas-receber")({
  head: () => ({ meta: [{ title: "Contas a Receber · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Contas a Receber" actions={<Button className="bg-[color:var(--primary)]">+ Nova</Button>} />
      <Card><CardContent className="p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {CONTAS_RECEBER.map((c, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{c.desc}</TableCell>
                <TableCell>{new Date(c.venc).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right font-semibold text-emerald-600">{brl(c.valor)}</TableCell>
                <TableCell><Badge variant="outline">A receber</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
