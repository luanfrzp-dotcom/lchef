import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UNIDADES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Configurações" subtitle="Empresa, unidades, PDV, impressão, metas e financeiro" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Dados da empresa</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div><Label>Razão Social</Label><Input defaultValue="L'Chef Café Ltda" /></div>
            <div><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" /></div>
            <div className="sm:col-span-2"><Label>Endereço</Label><Input defaultValue="Rua das Camélias, 123 — São Paulo/SP" /></div>
            <div><Label>Margem desejada padrão</Label><Input defaultValue="65%" /></div>
            <div><Label>Estoque mínimo padrão</Label><Input defaultValue="10" /></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-base">Unidades</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {UNIDADES.map(u => (
              <div key={u} className="flex items-center justify-between rounded-md border p-3">
                <span className="font-medium">{u}</span>
                <Button size="sm" variant="outline">Editar</Button>
              </div>
            ))}
            <Button size="sm" className="bg-[color:var(--primary)]">+ Nova Unidade</Button>
          </CardContent>
        </Card>
      </div>
    </>
  ),
});
