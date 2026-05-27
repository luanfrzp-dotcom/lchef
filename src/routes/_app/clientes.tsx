import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CLIENTES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({ meta: [{ title: "Clientes · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Clientes" actions={<Button className="bg-[color:var(--primary)]">+ Novo Cliente</Button>} />
      <Card><CardContent className="p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Telefone</TableHead><TableHead className="text-right">Ticket Médio</TableHead><TableHead className="text-right">Total Gasto</TableHead><TableHead>Última Compra</TableHead></TableRow></TableHeader>
          <TableBody>
            {CLIENTES.map(c => (
              <TableRow key={c.tel}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.tel}</TableCell>
                <TableCell className="text-right">{brl(c.ticket)}</TableCell>
                <TableCell className="text-right font-semibold text-[color:var(--primary)]">{brl(c.totalGasto)}</TableCell>
                <TableCell>{new Date(c.ultima).toLocaleDateString("pt-BR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
