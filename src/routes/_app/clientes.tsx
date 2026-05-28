import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({ meta: [{ title: "Clientes - L'Chef Cafe" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const { state } = useBusiness();

  return (
    <>
      <PageHeader
        title="Clientes"
        actions={<Button className="bg-[color:var(--primary)]">Novo cliente</Button>}
      />
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ticket medio</TableHead>
                <TableHead className="text-right">Total gasto</TableHead>
                <TableHead>Ultima compra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="text-right">{brl(customer.averageTicket)}</TableCell>
                  <TableCell className="text-right font-semibold text-[color:var(--primary)]">
                    {brl(customer.totalSpent)}
                  </TableCell>
                  <TableCell>
                    {customer.lastPurchaseAt
                      ? new Date(customer.lastPurchaseAt).toLocaleDateString("pt-BR")
                      : "-"}
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
