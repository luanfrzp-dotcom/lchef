import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FUNCIONARIOS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/funcionarios")({
  head: () => ({ meta: [{ title: "Funcionários · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Funcionários" actions={<Button className="bg-[color:var(--primary)]">+ Novo</Button>} />
      <Card><CardContent className="p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Cargo</TableHead><TableHead>Admissão</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {FUNCIONARIOS.map(f => (
              <TableRow key={f.nome}>
                <TableCell className="font-medium">{f.nome}</TableCell>
                <TableCell><Badge variant="secondary">{f.cargo}</Badge></TableCell>
                <TableCell>{new Date(f.admissao).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{f.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
