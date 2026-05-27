import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FORNECEDORES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/fornecedores")({
  head: () => ({ meta: [{ title: "Fornecedores · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Fornecedores" actions={<Button className="bg-[color:var(--primary)]">+ Novo Fornecedor</Button>} />
      <Card><CardContent className="p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>CNPJ</TableHead><TableHead>Categoria</TableHead><TableHead>Prazo</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {FORNECEDORES.map(f => (
              <TableRow key={f.cnpj}>
                <TableCell className="font-medium">{f.nome}</TableCell>
                <TableCell className="font-mono text-xs">{f.cnpj}</TableCell>
                <TableCell><Badge variant="secondary">{f.categoria}</Badge></TableCell>
                <TableCell>{f.prazo}</TableCell>
                <TableCell><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{f.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
