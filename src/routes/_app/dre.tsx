import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, brl } from "@/components/ui-bits";
import { calculateDre } from "@/lib/domain";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/dre")({
  head: () => ({ meta: [{ title: "DRE Gerencial - L'Chef Cafe" }] }),
  component: Dre,
});

function Dre() {
  const { state } = useBusiness();
  const dre = calculateDre(state);
  const rows = [
    ["Receita bruta", dre.grossRevenue],
    ["(-) Descontos", -dre.discounts],
    ["(+) Taxas", dre.fees],
    ["Receita liquida", dre.netRevenue, "subtotal"],
    ["(-) CMV", -dre.cmv],
    ["Lucro bruto", dre.grossProfit, "subtotal"],
    ["Margem bruta", `${dre.grossMargin.toFixed(1)}%`],
    ["(-) Despesas operacionais", -dre.operatingExpenses],
    ["Administrativas", -dre.administrativeExpenses],
    ["Comerciais", -dre.commercialExpenses],
    ["Folha", -dre.payroll],
    ["Marketing", -dre.marketing],
    ["EBITDA simplificado", dre.ebitda, "subtotal"],
    ["(-) Impostos", -dre.taxes],
    ["Lucro operacional", dre.operatingProfit, "total"],
    ["Margem liquida", `${dre.netMargin.toFixed(1)}%`, "total"],
  ] as const;

  return (
    <>
      <PageHeader
        title="DRE Gerencial"
        subtitle="Demonstrativo calculado a partir de vendas, CMV e financeiro"
        actions={<Button variant="outline">Exportar PDF</Button>}
      />
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, value, type]) => {
                const emphasis = type === "subtotal" || type === "total";
                const cls =
                  type === "total"
                    ? "bg-[color:var(--secondary)] text-[color:var(--primary)]"
                    : type === "subtotal"
                      ? "bg-muted/50"
                      : "";
                return (
                  <tr key={label} className={`border-b ${cls}`}>
                    <td className={`px-4 py-3 ${emphasis ? "font-semibold" : ""}`}>{label}</td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums ${emphasis ? "font-semibold" : ""} ${typeof value === "number" && value < 0 ? "text-red-700" : ""}`}
                    >
                      {typeof value === "number" ? brl(value) : value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
