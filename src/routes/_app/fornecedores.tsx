import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
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

export const Route = createFileRoute("/_app/fornecedores")({
  head: () => ({ meta: [{ title: "Fornecedores - L'Chef Cafe" }] }),
  component: FornecedoresPage,
});

function FornecedoresPage() {
  const { state } = useBusiness();

  return (
    <>
      <PageHeader
        title="Fornecedores"
        actions={<Button className="bg-[color:var(--primary)]">Novo fornecedor</Button>}
      />
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell className="font-mono text-xs">{supplier.document}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{supplier.category}</Badge>
                  </TableCell>
                  <TableCell>{supplier.paymentTerms}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {supplier.status === "active" ? "ativo" : "inativo"}
                    </Badge>
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
