import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FUNCIONARIOS } from "@/lib/mock-data";

const PERFIS = ["Administrador", "Gerente", "Caixa", "Cozinha", "Financeiro", "Contador"];

export const Route = createFileRoute("/_app/usuarios")({
  head: () => ({ meta: [{ title: "Usuários & Permissões · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Usuários & Permissões" actions={<Button className="bg-[color:var(--primary)]">+ Novo Usuário</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">{PERFIS.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}</div>
      <Card><CardContent className="p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Perfil</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {FUNCIONARIOS.map((f, i) => (
              <TableRow key={f.nome}>
                <TableCell className="font-medium">{f.nome}</TableCell>
                <TableCell><Badge variant="outline">{PERFIS[i % PERFIS.length]}</Badge></TableCell>
                <TableCell><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">ativo</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </>
  ),
});
