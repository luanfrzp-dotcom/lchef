import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const integrations = [
  { name: "Supabase", status: "configurado", detail: "Banco, auth e RLS previstos nas migrations" },
  { name: "iFood", status: "pendente", detail: "Canal reservado para pedidos externos" },
  { name: "WhatsApp", status: "pendente", detail: "Canal reservado para encomendas" },
  {
    name: "Gateway de pagamento",
    status: "pendente",
    detail: "Pagamentos do PDV registram metodo e valor",
  },
  { name: "OpenAI", status: "pendente", detail: "Analise inteligente preparada para dados reais" },
  { name: "Contabilidade", status: "configurado", detail: "Exportacao CSV no painel do contador" },
];

const color = (status: string) =>
  status === "configurado"
    ? "bg-emerald-100 text-emerald-700"
    : status === "pendente"
      ? "bg-amber-100 text-amber-700"
      : "bg-stone-100 text-stone-700";

export const Route = createFileRoute("/_app/integracoes")({
  head: () => ({ meta: [{ title: "Integracoes - L'Chef Cafe" }] }),
  component: () => (
    <>
      <PageHeader
        title="Integracoes"
        subtitle="iFood, WhatsApp, Supabase, gateway de pagamento e contabilidade"
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div>
                <div className="font-semibold">{integration.name}</div>
                <p className="mt-1 text-xs text-muted-foreground">{integration.detail}</p>
                <Badge
                  className={`mt-2 ${color(integration.status)} hover:${color(integration.status)}`}
                >
                  {integration.status}
                </Badge>
              </div>
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  ),
});
