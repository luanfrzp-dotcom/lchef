import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, brl } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  KPIS, VENDAS_DIARIAS, VENDAS_CANAL, CATEGORIAS_VENDAS, PRODUTOS, CONTAS_PAGAR,
} from "@/lib/mock-data";
import { TrendingUp, AlertTriangle, Coffee, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "Dashboard · L'Chef Café" }, { name: "description", content: "Painel executivo do L'Chef Café com vendas, CMV, margem, fluxo de caixa e indicadores." }] }),
  component: Dashboard,
});

const PALETTE = ["#6b4f3b", "#c9a24c", "#8a6a4a", "#3f2a1d", "#d9c39b"];

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Painel Executivo"
        subtitle="Visão geral de hoje · L'Chef Café"
        actions={<>
          <Button variant="outline" size="sm">Hoje</Button>
          <Button variant="outline" size="sm">7 dias</Button>
          <Button size="sm" className="bg-[color:var(--primary)] hover:bg-[color:var(--primary)]/90">Mês atual</Button>
        </>}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Faturamento Dia" value={brl(KPIS.faturamentoDia)} hint="↑ 8,2% vs ontem" accent="gold" />
        <StatCard label="Faturamento Mês" value={brl(KPIS.faturamentoMes)} hint={`↑ ${KPIS.variacaoMes}% vs mês anterior`} accent="success" />
        <StatCard label="Lucro Bruto" value={brl(KPIS.lucroBruto)} hint={`Margem ${KPIS.margemBruta}%`} />
        <StatCard label="CMV" value={`${KPIS.cmv}%`} hint="Meta: até 35%" accent="success" />
        <StatCard label="Ticket Médio" value={brl(KPIS.ticketMedio)} hint={`${KPIS.pedidos} pedidos`} />
        <StatCard label="Saldo de Caixa" value={brl(KPIS.saldoCaixa)} hint="Todas as contas" accent="gold" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Vendas x Despesas (últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VENDAS_DIARIAS}>
                <defs>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a24c" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#c9a24c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b4f3b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6b4f3b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d2" />
                <XAxis dataKey="dia" stroke="#8a6a4a" fontSize={12} />
                <YAxis stroke="#8a6a4a" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="vendas" stroke="#c9a24c" strokeWidth={2} fill="url(#gV)" name="Vendas" />
                <Area type="monotone" dataKey="despesas" stroke="#6b4f3b" strokeWidth={2} fill="url(#gD)" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Vendas por Canal</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={VENDAS_CANAL} dataKey="valor" nameKey="canal" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {VENDAS_CANAL.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Categorias mais vendidas</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORIAS_VENDAS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d2" />
                <XAxis dataKey="nome" stroke="#8a6a4a" fontSize={12} />
                <YAxis stroke="#8a6a4a" fontSize={12} />
                <Tooltip />
                <Bar dataKey="valor" fill="#6b4f3b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> Alertas Inteligentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" /> <span>Estoque crítico: <b>Cacau em pó</b> abaixo do mínimo</span></div>
            <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /> <span>Conta vencida: <b>Contador</b> — R$ 850,00</span></div>
            <div className="flex items-start gap-2"><TrendingUp className="mt-0.5 h-4 w-4 text-emerald-600" /> <span><b>Cookie de Chocolate</b> com alto giro — sugerir produção +30%</span></div>
            <div className="flex items-start gap-2"><Coffee className="mt-0.5 h-4 w-4 text-[color:var(--gold)]" /> <span>Margem baixa em <b>Torta de Chocolate</b> (60,8%)</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Top produtos (mês)</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {PRODUTOS.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-xs text-muted-foreground">{p.categoria} · margem {p.margem}%</div>
                  </div>
                  <Badge variant="secondary" className="bg-[color:var(--secondary)]">{brl(p.preco)}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contas a pagar próximas</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {CONTAS_PAGAR.map((c, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium">{c.desc}</div>
                    <div className="text-xs text-muted-foreground">Vence em {new Date(c.venc).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{brl(c.valor)}</span>
                    {c.status === "vencida"
                      ? <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Vencida</Badge>
                      : <Badge variant="outline">A vencer</Badge>}
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
