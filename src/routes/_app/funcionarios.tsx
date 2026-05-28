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

export const Route = createFileRoute("/_app/funcionarios")({
  head: () => ({ meta: [{ title: "Funcionarios - L'Chef Cafe" }] }),
  component: FuncionariosPage,
});

function FuncionariosPage() {
  const { state } = useBusiness();

  return (
    <>
      <PageHeader
        title="Funcionarios"
        actions={<Button className="bg-[color:var(--primary)]">Novo funcionario</Button>}
      />
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Admissao</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{employee.role}</Badge>
                  </TableCell>
                  <TableCell>{new Date(employee.hiredAt).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {employee.status === "active" ? "ativo" : "inativo"}
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
