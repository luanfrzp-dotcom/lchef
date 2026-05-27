import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PEDIDOS } from "@/lib/mock-data";
import { ChefHat, Clock, Flame, Package } from "lucide-react";

export const Route = createFileRoute("/_app/cozinha")({
  head: () => ({ meta: [{ title: "Cozinha · L'Chef Café" }] }),
  component: Cozinha,
});

const SETORES = [
  { key: "Barista", icon: Flame },
  { key: "Cozinha", icon: ChefHat },
  { key: "Confeitaria", icon: Package },
  { key: "Embalagem", icon: Package },
];

function Cozinha() {
  const ativos = PEDIDOS.filter(p => p.status === "novo" || p.status === "em-preparo");
  return (
    <>
      <PageHeader title="Cozinha & Produção" subtitle="Pedidos em produção, ficha técnica e setores" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SETORES.map(s => {
          const Ico = s.icon;
          return (
            <Card key={s.key}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Ico className="h-4 w-4 text-[color:var(--gold)]" /> {s.key}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ativos.slice(0, 3).map(p => (
                  <div key={p.id} className="rounded-md border p-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">{p.id}</span>
                      <Badge variant={p.status === "novo" ? "outline" : "default"} className={p.status === "em-preparo" ? "bg-amber-500" : ""}>
                        {p.status === "novo" ? "Novo" : "Em preparo"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{p.cliente} · {p.itens} itens</div>
                    <div className="mt-1 flex items-center gap-1 text-xs"><Clock className="h-3 w-3" /> {p.hora}</div>
                    <div className="mt-2 flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Em preparo</Button>
                      <Button size="sm" className="h-7 bg-emerald-600 text-xs hover:bg-emerald-700">Pronto</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Previsão de produção do dia</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            <li className="flex justify-between py-2"><span>Cookie de Chocolate</span><span className="font-semibold">40 un</span></li>
            <li className="flex justify-between py-2"><span>Brownie Bean-to-Bar</span><span className="font-semibold">28 un</span></li>
            <li className="flex justify-between py-2"><span>Croissant</span><span className="font-semibold">35 un</span></li>
            <li className="flex justify-between py-2"><span>Pão de Queijo</span><span className="font-semibold">120 un</span></li>
            <li className="flex justify-between py-2"><span>Bolo de Cenoura</span><span className="font-semibold">4 un</span></li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
