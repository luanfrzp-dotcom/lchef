import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PEDIDOS } from "@/lib/mock-data";
import { brl } from "@/components/ui-bits";

export const Route = createFileRoute("/_app/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos · L'Chef Café" }] }),
  component: Pedidos,
});

const COLS: { key: any; label: string; cls: string }[] = [
  { key: "novo", label: "Novos", cls: "border-blue-400" },
  { key: "em-preparo", label: "Em Preparo", cls: "border-amber-400" },
  { key: "pronto", label: "Prontos", cls: "border-emerald-400" },
  { key: "saiu-entrega", label: "Saiu p/ Entrega", cls: "border-[color:var(--gold)]" },
  { key: "entregue", label: "Entregues", cls: "border-stone-400" },
  { key: "cancelado", label: "Cancelados", cls: "border-red-400" },
];

function Pedidos() {
  return (
    <>
      <PageHeader title="Pedidos" subtitle="Acompanhamento em tempo real · Kanban por status"
        actions={<Button asChild className="bg-[color:var(--primary)]"><Link to="/pdv">+ Novo Pedido</Link></Button>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {COLS.map(c => {
          const items = PEDIDOS.filter(p => p.status === c.key);
          return (
            <div key={c.key} className={`rounded-lg border-t-4 bg-muted/40 p-2 ${c.cls}`}>
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{c.label}</span>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map(p => (
                  <Card key={p.id} className="border-border/70">
                    <CardContent className="p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{p.id}</span>
                        <span className="text-xs text-muted-foreground">{p.hora}</span>
                      </div>
                      <div className="mt-1">{p.cliente}</div>
                      <div className="text-xs text-muted-foreground">{p.canal} · {p.itens} itens</div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="secondary">{p.pagamento}</Badge>
                        <span className="font-semibold text-[color:var(--primary)]">{brl(p.total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!items.length && <div className="px-2 py-6 text-center text-xs text-muted-foreground">Vazio</div>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
