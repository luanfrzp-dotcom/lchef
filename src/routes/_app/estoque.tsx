import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, brl } from "@/components/ui-bits";
import { useBusiness } from "@/lib/store";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/estoque")({
  head: () => ({ meta: [{ title: "Estoque - L'Chef Cafe" }] }),
  component: Estoque,
});

function Estoque() {
  const { state, moveInventory } = useBusiness();
  const critical = state.inventoryItems.filter((item) => item.quantity <= item.minQuantity);
  const stockValue = state.inventoryItems.reduce((sum, item) => sum + item.quantity * item.cost, 0);

  async function registerEntry() {
    const first = state.inventoryItems[0];
    if (!first) return;
    try {
      await moveInventory({
        inventoryItemId: first.id,
        type: "in",
        quantity: 1,
        unit: first.unit,
        reason: "Entrada manual de teste",
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Erro ao movimentar estoque.");
    }
  }

  return (
    <>
      <PageHeader
        title="Estoque"
        subtitle="Insumos, produtos acabados, lotes, validades e movimentacoes"
        actions={
          <>
            <Button variant="outline">Inventario</Button>
            <Button className="bg-[color:var(--primary)]" onClick={registerEntry}>
              + Entrada
            </Button>
          </>
        }
      />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        {[
          { label: "Itens cadastrados", value: String(state.inventoryItems.length) },
          { label: "Estoque critico", value: String(critical.length), className: "text-red-600" },
          {
            label: "Movimentacoes",
            value: String(state.inventoryMovements.length),
            className: "text-amber-600",
          },
          {
            label: "Valor em estoque",
            value: brl(stockValue),
            className: "text-[color:var(--gold)]",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">{stat.label}</div>
              <div className={`text-xl font-semibold ${stat.className ?? ""}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.inventoryItems.map((item) => {
                const isCritical = item.quantity <= item.minQuantity;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity.toFixed(3).replace(/\.?0+$/, "")} {item.unit}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.minQuantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">{brl(item.cost)}</TableCell>
                    <TableCell>
                      {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell>
                      {isCritical ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          <AlertTriangle className="mr-1 h-3 w-3" /> critico
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          ok
                        </Badge>
                      )}
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
