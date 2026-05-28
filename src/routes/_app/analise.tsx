import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingDown, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { calculateDre, dashboardMetrics } from "@/lib/domain";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/analise")({
  head: () => ({ meta: [{ title: "Analise Inteligente - L'Chef Cafe" }] }),
  component: AnalisePage,
});

function AnalisePage() {
  const { state } = useBusiness();
  const metrics = dashboardMetrics(state);
  const dre = calculateDre(state);
  const topProduct = state.orders
    .flatMap((order) => order.items)
    .reduce<
      Record<string, number>
    >((acc, item) => ({ ...acc, [item.name]: (acc[item.name] ?? 0) + item.quantity }), {});
  const bestSeller =
    Object.entries(topProduct).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sem vendas no periodo";
  const lowMargin = state.products
    .map((product) => ({
      product,
      margin: product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0,
    }))
    .sort((a, b) => a.margin - b.margin)[0];
  const critical = metrics.criticalStock[0];

  const insights = [
    {
      icon: TrendingDown,
      color: "text-amber-600",
      title: "Margem baixa",
      detail: lowMargin
        ? `${lowMargin.product.name} esta com margem estimada de ${lowMargin.margin.toFixed(1)}%.`
        : "Sem produtos cadastrados.",
    },
    {
      icon: TrendingUp,
      color: "text-emerald-600",
      title: "Alto giro",
      detail:
        bestSeller === "Sem vendas no periodo"
          ? "Venda pelo PDV para gerar ranking real."
          : `${bestSeller} lidera as vendas registradas.`,
    },
    {
      icon: AlertTriangle,
      color: "text-red-600",
      title: "Estoque critico",
      detail: critical
        ? `${critical.name} esta abaixo do minimo (${critical.quantity}${critical.unit}).`
        : "Nenhum insumo abaixo do minimo.",
    },
    {
      icon: Package,
      color: "text-[color:var(--gold)]",
      title: "CMV",
      detail: `CMV gerencial em ${dre.netRevenue > 0 ? ((dre.cmv / dre.netRevenue) * 100).toFixed(1) : "0.0"}% sobre a receita liquida.`,
    },
    {
      icon: Sparkles,
      color: "text-[color:var(--gold)]",
      title: "Resumo do dia",
      detail: `Hoje foram registrados ${metrics.orderCount} pedidos no mes e ${metrics.criticalStock.length} alertas de estoque.`,
    },
  ];

  return (
    <>
      <PageHeader
        title="Analise Inteligente"
        subtitle="Insights calculados a partir dos dados operacionais atuais"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className={`h-4 w-4 ${insight.color}`} /> {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{insight.detail}</CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
