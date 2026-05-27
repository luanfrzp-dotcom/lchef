import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingDown, TrendingUp, Package, AlertTriangle } from "lucide-react";

const INSIGHTS = [
  { i: TrendingDown, c: "text-amber-600", t: "Margem baixa", d: "Torta de Chocolate com margem 60,8% — reavaliar precificação ou substituir fornecedor de chocolate." },
  { i: TrendingUp, c: "text-emerald-600", t: "Alto giro", d: "Cookie de Chocolate vendeu 32% acima da média. Sugerir produção +30% e combo com café." },
  { i: AlertTriangle, c: "text-red-600", t: "Ruptura prevista", d: "Cacau em pó deve acabar em ~3 dias no ritmo atual. Sugerir compra de 5kg." },
  { i: Package, c: "text-[color:var(--gold)]", t: "Oportunidade de combo", d: "78% dos clientes de Espresso compram um doce — criar combo dedicado." },
  { i: Sparkles, c: "text-[color:var(--gold)]", t: "Resumo do dia", d: "Faturamento 8,2% acima de ontem. iFood subindo, WhatsApp estável, loja física firme." },
  { i: TrendingDown, c: "text-amber-600", t: "Despesa acima da média", d: "Embalagens 18% acima do trimestre anterior — revisar fornecedor." },
];

export const Route = createFileRoute("/_app/analise")({
  head: () => ({ meta: [{ title: "Análise Inteligente · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Análise Inteligente" subtitle="Insights preparados para integração futura com IA (OpenAI)" />
      <div className="grid gap-4 md:grid-cols-2">
        {INSIGHTS.map((x, i) => {
          const Ico = x.i;
          return (
            <Card key={i}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Ico className={`h-4 w-4 ${x.c}`} /> {x.t}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">{x.d}</CardContent>
            </Card>
          );
        })}
      </div>
    </>
  ),
});
