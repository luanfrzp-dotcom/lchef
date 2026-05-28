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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/lib/store";

const statusLabel = {
  order: "pedido",
  received: "recebido",
  paid: "pago",
  canceled: "cancelado",
};

export const Route = createFileRoute("/_app/compras")({
  head: () => ({ meta: [{ title: "Compras - L'Chef Cafe" }] }),
  component: ComprasPage,
});

function ComprasPage() {
  const { state, receivePurchase, payPurchase } = useBusiness();

  return (
    <>
      <PageHeader
        title="Compras"
        subtitle="Pedidos de compra, recebimento e atualizacao automatica de estoque"
        actions={<Button className="bg-[color:var(--primary)]">Nova compra</Button>}
      />
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NF</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-mono text-xs">{purchase.invoiceNumber}</TableCell>
                  <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                  <TableCell>{new Date(purchase.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-right font-semibold">{brl(purchase.total)}</TableCell>
                  <TableCell>{purchase.paymentTerms}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{statusLabel[purchase.status]}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    {purchase.status === "order" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => receivePurchase(purchase.id)}
                      >
                        Receber
                      </Button>
                    )}
                    {purchase.paymentStatus === "open" && (
                      <Button
                        size="sm"
                        className="bg-[color:var(--primary)]"
                        onClick={() => payPurchase(purchase.id)}
                      >
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
