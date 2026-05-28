import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, brl } from "@/components/ui-bits";
import { cashFlowProjection } from "@/lib/domain";
import { useBusiness } from "@/lib/store";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_app/fluxo-caixa")({
  head: () => ({ meta: [{ title: "Fluxo de Caixa - L'Chef Cafe" }] }),
  component: FluxoCaixa,
});

function FluxoCaixa() {
  const { state } = useBusiness();
  const data = cashFlowProjection(state).map((row) => ({
    ...row,
    dia: new Date(row.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    entradas: row.inflow,
    saidas: row.outflow,
    saldo: row.balance,
  }));

  return (
    <>
      <PageHeader title="Fluxo de Caixa" subtitle="Entradas, saidas e saldo projetado" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projecao</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d2" />
              <XAxis dataKey="dia" stroke="#8a6a4a" fontSize={12} />
              <YAxis stroke="#8a6a4a" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="entradas"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
              <Line type="monotone" dataKey="saidas" stroke="#dc2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="saldo" stroke="#c9a24c" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="text-right">Entrada</TableHead>
                <TableHead className="text-right">Saida</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={`${row.date}-${index}`}>
                  <TableCell>{new Date(row.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell className="text-right text-emerald-600">
                    {row.inflow ? brl(row.inflow) : "-"}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {row.outflow ? brl(row.outflow) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{brl(row.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
