import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INTEGRACOES } from "@/lib/mock-data";

const cor = (s: string) =>
  s === "conectado" ? "bg-emerald-100 text-emerald-700"
  : s === "pendente" ? "bg-amber-100 text-amber-700"
  : s === "erro" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-700";

export const Route = createFileRoute("/_app/integracoes")({
  head: () => ({ meta: [{ title: "Integrações · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Integrações" subtitle="iFood, WhatsApp, Bling, OpenAI, gateway de pagamento e mais" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {INTEGRACOES.map(i => (
          <Card key={i.nome}><CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="font-semibold">{i.nome}</div>
              <Badge className={`mt-1 hover:${cor(i.status)} ${cor(i.status)}`}>{i.status}</Badge>
            </div>
            <Button size="sm" variant="outline">{i.status === "conectado" ? "Gerenciar" : "Conectar"}</Button>
          </CardContent></Card>
        ))}
      </div>
    </>
  ),
});
