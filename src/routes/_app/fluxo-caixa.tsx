import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

const data = Array.from({ length: 30 }, (_, i) => ({
  dia: i + 1,
  entradas: 1500 + Math.round(Math.sin(i / 3) * 800 + Math.random() * 600),
  saidas: 1200 + Math.round(Math.cos(i / 4) * 500 + Math.random() * 400),
})).map((d, i, arr) => ({ ...d, saldo: arr.slice(0, i + 1).reduce((s, x) => s + x.entradas - x.saidas, 8000) }));

export const Route = createFileRoute("/_app/fluxo-caixa")({
  head: () => ({ meta: [{ title: "Fluxo de Caixa · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Fluxo de Caixa" subtitle="Entradas, saídas e saldo projetado dos próximos 30 dias" />
      <Card><CardHeader><CardTitle className="text-base">Projeção · 30 dias</CardTitle></CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer><LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d2" />
            <XAxis dataKey="dia" stroke="#8a6a4a" fontSize={12} />
            <YAxis stroke="#8a6a4a" fontSize={12} />
            <Tooltip /><Legend />
            <Line type="monotone" dataKey="entradas" stroke="#16a34a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="saidas" stroke="#dc2626" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="saldo" stroke="#c9a24c" strokeWidth={3} dot={false} />
          </LineChart></ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  ),
});
