import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, brl } from "@/components/ui-bits";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/contas-pagar")({
  head: () => ({ meta: [{ title: "Contas a Pagar - L'Chef Cafe" }] }),
  component: ContasPagar,
});

function ContasPagar() {
  const { state, markPaid } = useBusiness();
  const records = state.financialRecords.filter((record) => record.type === "expense");

  return (
    <>
      <PageHeader
        title="Contas a Pagar"
        actions={<Button className="bg-[color:var(--primary)]">+ Nova Conta</Button>}
      />
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.description}</TableCell>
                  <TableCell>{new Date(record.dueDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{record.category}</TableCell>
                  <TableCell className="text-right font-semibold">{brl(record.amount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === "overdue"
                          ? "destructive"
                          : record.status === "paid"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {record.status === "paid"
                        ? "Paga"
                        : record.status === "overdue"
                          ? "Vencida"
                          : "Aberta"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {record.status !== "paid" && record.status !== "canceled" && (
                      <Button size="sm" variant="outline" onClick={() => markPaid(record.id)}>
                        Pagar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
