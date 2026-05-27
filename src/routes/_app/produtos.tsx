import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRODUTOS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/produtos")({
  head: () => ({ meta: [{ title: "Produtos · L'Chef Café" }] }),
  component: Produtos,
});

function Produtos() {
  return (
    <>
      <PageHeader title="Produtos & Cardápio" subtitle="Catálogo completo, custos, margens e disponibilidade"
        actions={<Button className="bg-[color:var(--primary)]">+ Novo Produto</Button>} />
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <Input placeholder="Buscar produto..." className="max-w-xs" />
            <Button variant="outline" size="sm">Filtros</Button>
            <Button variant="outline" size="sm" className="ml-auto">Exportar</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PRODUTOS.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell><Badge variant="secondary">{p.categoria}</Badge></TableCell>
                  <TableCell className="text-right">{brl(p.custo)}</TableCell>
                  <TableCell className="text-right font-semibold">{brl(p.preco)}</TableCell>
                  <TableCell className={`text-right ${p.margem < 65 ? "text-amber-600" : "text-emerald-600"}`}>{p.margem}%</TableCell>
                  <TableCell className="text-right">{p.estoque > 100 ? "—" : p.estoque}</TableCell>
                  <TableCell><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
