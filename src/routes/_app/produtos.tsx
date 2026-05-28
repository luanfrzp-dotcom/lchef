import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, brl } from "@/components/ui-bits";
import { calculateRecipeMetrics } from "@/lib/domain";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/produtos")({
  head: () => ({ meta: [{ title: "Produtos - L'Chef Cafe" }] }),
  component: Produtos,
});

function Produtos() {
  const { state } = useBusiness();
  return (
    <>
      <PageHeader
        title="Produtos & Cardapio"
        subtitle="Catalogo completo, custos, margens e disponibilidade"
        actions={<Button className="bg-[color:var(--primary)]">+ Novo Produto</Button>}
      />
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <Input placeholder="Buscar produto..." className="max-w-xs" />
            <Button variant="outline" size="sm">
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="ml-auto">
              Exportar CSV
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codigo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Preco</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.products.map((product) => {
                const recipe = product.recipeId
                  ? state.recipes.find((item) => item.id === product.recipeId)
                  : undefined;
                const metrics = recipe
                  ? calculateRecipeMetrics(recipe, product, state.inventoryItems)
                  : undefined;
                const margin =
                  metrics?.grossMargin ??
                  (product.price ? ((product.price - product.cost) / product.price) * 100 : 0);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.id}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {brl(metrics?.costPerUnit ?? product.cost)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{brl(product.price)}</TableCell>
                    <TableCell
                      className={`text-right ${margin < 65 ? "text-amber-600" : "text-emerald-600"}`}
                    >
                      {margin.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {product.stock > 100 ? "-" : product.stock}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {product.status === "active" ? "ativo" : "inativo"}
                      </Badge>
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
