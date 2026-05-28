import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria - L'Chef Cafe" }] }),
  component: AuditoriaPage,
});

function AuditoriaPage() {
  const { state } = useBusiness();
  const userName = (userId: string) =>
    state.users.find((user) => user.id === userId)?.name ?? "Sistema";

  return (
    <>
      <PageHeader title="Auditoria / Logs" subtitle="Historico de acoes sensiveis" />
      <Card>
        <CardContent className="p-0">
          {state.auditLogs.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Nenhum log registrado.</div>
          ) : (
            <ul className="divide-y text-sm">
              {state.auditLogs.map((log) => (
                <li key={log.id} className="grid gap-2 px-4 py-3 md:grid-cols-[160px_180px_1fr]">
                  <span className="text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </span>
                  <span className="font-medium">{userName(log.userId)}</span>
                  <span>
                    <b className="text-[color:var(--primary)]">{log.action}:</b> {log.details}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
