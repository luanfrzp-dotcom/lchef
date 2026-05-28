import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, brl } from "@/components/ui-bits";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/domain";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos - L'Chef Cafe" }] }),
  component: Pedidos,
});

const columns: { key: OrderStatus; label: string; cls: string }[] = [
  { key: "new", label: "Novos", cls: "border-blue-400" },
  { key: "preparing", label: "Em preparo", cls: "border-amber-400" },
  { key: "ready", label: "Prontos", cls: "border-emerald-400" },
  { key: "delivered", label: "Entregues", cls: "border-stone-400" },
  { key: "canceled", label: "Cancelados", cls: "border-red-400" },
];

function Pedidos() {
  const { state, changeOrderStatus, cancelSale } = useBusiness();

  async function advance(id: string, status: OrderStatus) {
    try {
      await changeOrderStatus(id, status);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Nao foi possivel alterar o pedido.");
    }
  }

  return (
    <>
      <PageHeader
        title="Pedidos"
        subtitle="Acompanhamento em tempo real por status"
        actions={
          <Button asChild className="bg-[color:var(--primary)]">
            <Link to="/pdv">+ Novo Pedido</Link>
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {columns.map((column) => {
          const items = state.orders.filter((order) => order.status === column.key);
          return (
            <div key={column.key} className={`rounded-lg border-t-4 bg-muted/40 p-2 ${column.cls}`}>
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{column.label}</span>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((order) => (
                  <Card key={order.id} className="border-border/70">
                    <CardContent className="p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{order.id.slice(0, 14)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="mt-1">{order.customerName ?? "Balcao"}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.channel} - {order.items.length} itens
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
                        <span className="font-semibold text-[color:var(--primary)]">
                          {brl(order.total)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {order.status === "new" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => advance(order.id, "preparing")}
                          >
                            Preparar
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => advance(order.id, "ready")}
                          >
                            Pronto
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => advance(order.id, "delivered")}
                          >
                            Entregar
                          </Button>
                        )}
                        {!["delivered", "canceled"].includes(order.status) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelSale(order.id, "Cancelado pela operacao")}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!items.length && (
                  <div className="px-2 py-6 text-center text-xs text-muted-foreground">Vazio</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
