import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard, brl } from "@/components/ui-bits";
import { dashboardMetrics } from "@/lib/domain";
import { useBusiness } from "@/lib/store";
import { AlertTriangle, Coffee, Sparkles, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard - L'Chef Cafe" },
      {
        name: "description",
        content: "Painel executivo com vendas, CMV, margem, fluxo de caixa e indicadores reais.",
      },
    ],
  }),
  component: Dashboard,
});

const palette = ["#6b4f3b", "#c9a24c", "#8a6a4a", "#3f2a1d", "#d9c39b"];

function Dashboard() {
  const { state } = useBusiness();
  const metrics = dashboardMetrics(state);
  const orders = state.orders.filter((order) => order.status !== "canceled");

  const daily = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const key = day.toISOString().slice(0, 10);
    const sales = orders
      .filter((order) => order.createdAt.startsWith(key))
      .reduce((sum, order) => sum + order.total, 0);
    const expenses = state.financialRecords
      .filter(
        (record) =>
          record.type === "expense" && record.status !== "canceled" && record.dueDate === key,
      )
      .reduce((sum, record) => sum + record.amount, 0);
    return {
      day: day.toLocaleDateString("pt-BR", { weekday: "short" }),
      vendas: sales,
      despesas: expenses,
    };
  });

  const byChannel = Array.from(new Set(orders.map((order) => order.channel))).map((channel) => ({
    channel,
    value: orders
      .filter((order) => order.channel === channel)
      .reduce((sum, order) => sum + order.total, 0),
  }));

  const byCategory = Array.from(new Set(state.products.map((product) => product.category)))
    .map((category) => {
      const productIds = state.products
        .filter((product) => product.category === category)
        .map((product) => product.id);
      return {
        name: category,
        value: orders.reduce(
          (sum, order) =>
            sum +
            order.items
              .filter((item) => productIds.includes(item.productId))
              .reduce((itemSum, item) => itemSum + item.unitPrice * item.quantity, 0),
          0,
        ),
      };
    })
    .filter((row) => row.value > 0);

  return (
    <>
      <PageHeader
        title="Painel Executivo"
        subtitle="Dados operacionais reais do ambiente de testes"
        actions={
          <>
            <Button variant="outline" size="sm">
              Hoje
            </Button>
            <Button size="sm" className="bg-[color:var(--primary)]">
              Mes atual
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Faturamento Dia" value={brl(metrics.revenueToday)} accent="gold" />
        <StatCard label="Faturamento Mes" value={brl(metrics.revenueMonth)} accent="success" />
        <StatCard
          label="Pedidos"
          value={String(metrics.orderCount)}
          hint={`Ticket ${brl(metrics.averageTicket)}`}
        />
        <StatCard
          label="Lucro Bruto"
          value={brl(metrics.grossProfit)}
          hint={`Margem ${metrics.grossMargin.toFixed(1)}%`}
        />
        <StatCard
          label="CMV"
          value={`${metrics.cmv.toFixed(1)}%`}
          hint="Calculado por ficha tecnica"
        />
        <StatCard label="Despesas Mes" value={brl(metrics.monthExpenses)} accent="danger" />
      </div>

      {!orders.length && (
        <Card className="mt-6 border-dashed">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Nenhuma venda real foi registrada ainda. Abra o caixa no PDV e finalize uma venda para
            alimentar dashboard, DRE, fluxo de caixa, estoque e pedidos.
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Receitas x despesas</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d2" />
                <XAxis dataKey="day" stroke="#8a6a4a" fontSize={12} />
                <YAxis stroke="#8a6a4a" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="vendas"
                  stroke="#c9a24c"
                  strokeWidth={2}
                  fill="#c9a24c55"
                  name="Vendas"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  stroke="#6b4f3b"
                  strokeWidth={2}
                  fill="#6b4f3b33"
                  name="Despesas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por canal</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {byChannel.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byChannel}
                    dataKey="value"
                    nameKey="channel"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {byChannel.map((_, index) => (
                      <Cell key={index} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Sem vendas no periodo
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Categorias vendidas</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {byCategory.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d2" />
                  <XAxis dataKey="name" stroke="#8a6a4a" fontSize={12} />
                  <YAxis stroke="#8a6a4a" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6b4f3b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Sem categorias vendidas
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {metrics.criticalStock.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                <span>
                  Estoque critico: <b>{item.name}</b> ({item.quantity} {item.unit})
                </span>
              </div>
            ))}
            <div className="flex items-start gap-2">
              <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-600" />{" "}
              <span>{state.orders.length} pedidos registrados no sistema.</span>
            </div>
            <div className="flex items-start gap-2">
              <Coffee className="mt-0.5 h-4 w-4 text-[color:var(--gold)]" />{" "}
              <span>CMV recalculado a partir de fichas tecnicas.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos com baixa margem</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {state.products.slice(0, 6).map((product) => (
                <li key={product.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.category}</div>
                  </div>
                  <Badge variant="secondary" className="bg-[color:var(--secondary)]">
                    {brl(product.price)}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contas a pagar proximas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {state.financialRecords
                .filter((record) => record.type === "expense" && record.status !== "paid")
                .slice(0, 5)
                .map((record) => (
                  <li key={record.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <div className="font-medium">{record.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Vence em {new Date(record.dueDate).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{brl(record.amount)}</span>
                      <Badge variant={record.status === "overdue" ? "destructive" : "outline"}>
                        {record.status === "overdue" ? "Vencida" : "A vencer"}
                      </Badge>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
