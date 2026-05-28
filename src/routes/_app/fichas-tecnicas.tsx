import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, brl } from "@/components/ui-bits";
import { calculateRecipeMetrics } from "@/lib/domain";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/fichas-tecnicas")({
  head: () => ({ meta: [{ title: "Fichas Tecnicas - L'Chef Cafe" }] }),
  component: Fichas,
});

function Fichas() {
  const { state } = useBusiness();
  const recipe = state.recipes[0];
  const product = recipe ? state.products.find((item) => item.id === recipe.productId) : undefined;
  const metrics =
    recipe && product ? calculateRecipeMetrics(recipe, product, state.inventoryItems) : undefined;

  return (
    <>
      <PageHeader
        title="Fichas Tecnicas"
        subtitle="Receitas, custos, rendimento e CMV calculados automaticamente"
        actions={<Button className="bg-[color:var(--primary)]">+ Nova Ficha</Button>}
      />

      {!recipe || !product || !metrics ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Nenhuma ficha tecnica cadastrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{recipe.name}</span>
                <Badge variant="outline">{recipe.version}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="py-2">Ingrediente</th>
                    <th>Qtd</th>
                    <th>Un</th>
                    <th className="text-right">Custo</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recipe.items.map((item) => {
                    const inventory = state.inventoryItems.find(
                      (inv) => inv.id === item.inventoryItemId,
                    );
                    const cost = (inventory?.cost ?? 0) * item.quantity;
                    return (
                      <tr key={item.inventoryItemId}>
                        <td className="py-2">{inventory?.name ?? item.inventoryItemId}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td className="text-right">{brl(cost)}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-semibold">
                    <td className="pt-3" colSpan={3}>
                      Custo total da receita
                    </td>
                    <td className="pt-3 text-right text-[color:var(--primary)]">
                      {brl(metrics.costTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Rendimento</div>
                <div className="text-xl font-semibold">{recipe.yieldQty} unidades</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Custo / un</div>
                <div className="text-xl font-semibold">{brl(metrics.costPerUnit)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Preco venda</div>
                <div className="text-xl font-semibold text-[color:var(--primary)]">
                  {brl(product.price)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Margem / CMV</div>
                <div className="text-xl font-semibold text-emerald-600">
                  {metrics.grossMargin.toFixed(1)}% / {metrics.cmv.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Preco sugerido</div>
                <div className="text-xl font-semibold">{brl(metrics.suggestedPrice)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 p-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Preparo:</span> {recipe.preparation}
                </div>
                <div>
                  <span className="text-muted-foreground">Validade:</span> {recipe.validityDays}{" "}
                  dias
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
