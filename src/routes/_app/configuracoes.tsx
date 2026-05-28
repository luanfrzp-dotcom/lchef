import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({ meta: [{ title: "Configuracoes - L'Chef Cafe" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { state, resetDemo } = useBusiness();

  return (
    <>
      <PageHeader
        title="Configuracoes"
        subtitle="Empresa, unidades, PDV, impressao, metas e financeiro"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Razao Social</Label>
              <Input defaultValue="L'Chef Cafe Ltda" />
            </div>
            <div>
              <Label>CNPJ</Label>
              <Input defaultValue="12.345.678/0001-90" />
            </div>
            <div className="sm:col-span-2">
              <Label>Endereco</Label>
              <Input defaultValue="Rua das Camelias, 123 - Sao Paulo/SP" />
            </div>
            <div>
              <Label>Margem desejada padrao</Label>
              <Input defaultValue="65%" />
            </div>
            <div>
              <Label>Estoque minimo padrao</Label>
              <Input defaultValue="10" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.units.map((unit) => (
              <div key={unit} className="flex items-center justify-between rounded-md border p-3">
                <span className="font-medium">{unit}</span>
                <Button size="sm" variant="outline">
                  Editar
                </Button>
              </div>
            ))}
            <Button size="sm" className="bg-[color:var(--primary)]">
              Nova unidade
            </Button>
            <Button size="sm" variant="outline" onClick={resetDemo}>
              Restaurar dados de teste
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
