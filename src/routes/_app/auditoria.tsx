import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { AUDIT_LOGS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria · L'Chef Café" }] }),
  component: () => (
    <>
      <PageHeader title="Auditoria / Logs" subtitle="Histórico de ações sensíveis" />
      <Card><CardContent className="p-0">
        <ul className="divide-y text-sm">
          {AUDIT_LOGS.map((l, i) => (
            <li key={i} className="grid grid-cols-[160px_180px_1fr] gap-3 px-4 py-3">
              <span className="text-muted-foreground">{l.quando}</span>
              <span className="font-medium">{l.usuario}</span>
              <span><b className="text-[color:var(--primary)]">{l.acao}:</b> {l.detalhe}</span>
            </li>
          ))}
        </ul>
      </CardContent></Card>
    </>
  ),
});
