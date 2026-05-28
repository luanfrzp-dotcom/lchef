import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-bits";
import { ORDER_STATUS_LABELS } from "@/lib/domain";
import { useBusiness } from "@/lib/store";
import { ChefHat, Clock, Flame, Package } from "lucide-react";

export const Route = createFileRoute("/_app/cozinha")({
  head: () => ({ meta: [{ title: "Cozinha - L'Chef Cafe" }] }),
  component: Cozinha,
});

const sectors = [
  { key: "Barista", icon: Flame },
  { key: "Cozinha", icon: ChefHat },
  { key: "Confeitaria", icon: Package },
  { key: "Embalagem", icon: Package },
];

function Cozinha() {
  const { state, changeOrderStatus } = useBusiness();
  const activeOrders = state.orders.filter(
    (order) => order.status === "new" || order.status === "preparing",
  );

  return (
    <>
      <PageHeader
        title="Cozinha & Producao"
        subtitle="Pedidos em producao, ficha tecnica e setores"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sectors.map((sector) => {
          const Icon = sector.icon;
          return (
            <Card key={sector.key}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-[color:var(--gold)]" /> {sector.key}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeOrders.slice(0, 6).map((order) => (
                  <div key={order.id} className="rounded-md border p-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">{order.id.slice(0, 14)}</span>
                      <Badge
                        variant={order.status === "new" ? "outline" : "default"}
                        className={order.status === "preparing" ? "bg-amber-500" : ""}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.customerName ?? "Balcao"} - {order.items.length} itens
                    </div>
                    <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                      {order.items.map((item) => (
                        <li key={item.productId}>
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />{" "}
                      {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="mt-2 flex gap-1">
                      {order.status === "new" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => changeOrderStatus(order.id, "preparing")}
                        >
                          Em preparo
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button
                          size="sm"
                          className="h-7 bg-emerald-600 text-xs hover:bg-emerald-700"
                          onClick={() => changeOrderStatus(order.id, "ready")}
                        >
                          Pronto
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {!activeOrders.length && (
                  <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
                    Sem pedidos ativos
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
