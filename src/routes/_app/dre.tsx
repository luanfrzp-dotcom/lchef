import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, brl } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DRE } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dre")({
  head: () => ({ meta: [{ title: "DRE Gerencial · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="DRE Gerencial" subtitle="Demonstrativo do Resultado · Mês atual"
        actions={<Button variant="outline">Exportar PDF</Button>} />
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <tbody>
            {DRE.map((l, i) => {
              const bold = l.tipo === "subtotal" || l.tipo === "total";
              const cls = l.tipo === "total" ? "bg-[color:var(--secondary)] text-[color:var(--primary)]"
                : l.tipo === "subtotal" ? "bg-muted/50" : "";
              return (
                <tr key={i} className={`border-b ${cls}`}>
                  <td className={`px-4 py-3 ${bold ? "font-semibold" : ""}`}>{l.linha}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${bold ? "font-semibold" : ""} ${l.valor < 0 ? "text-red-700" : ""}`}>
                    {brl(l.valor)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent></Card>
    </>
  ),
});
