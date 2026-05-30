import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CashClosingPanel } from "@/components/cash-closing-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, StatCard, brl } from "@/components/ui-bits";
import { dashboardMetrics, expectedCashAmount } from "@/lib/domain";
import { useBusiness, useOpenCashRegister } from "@/lib/store";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro - L'Chef Cafe" }] }),
  component: Financeiro,
});

function Financeiro() {
  const { state, closeCash, supplyCash, withdrawCash } = useBusiness();
  const cash = useOpenCashRegister();
  const metrics = dashboardMetrics(state);
  const balance = cash ? expectedCashAmount(cash) : 0;
  const [movementAmount, setMovementAmount] = useState(0);
  const [movementNote, setMovementNote] = useState("");
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState<"supply" | "withdrawal" | null>(null);

  async function runCashAction(action: "supply" | "withdrawal") {
    if (!cash) {
      setMessage("Nao ha caixa aberto para esta operacao.");
      return;
    }

    if (movementAmount <= 0) {
      setMessage("Informe um valor valido.");
      return;
    }

    setBusyAction(action);
    setMessage("");
    try {
      if (action === "supply") {
        await supplyCash(movementAmount, movementNote || "Suprimento de caixa");
        setMessage("Suprimento registrado com sucesso.");
      } else {
        await withdrawCash(movementAmount, movementNote || "Sangria de caixa");
        setMessage("Sangria registrada com sucesso.");
      }
      setMovementAmount(0);
      setMovementNote("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operacao de caixa nao concluida.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      <PageHeader title="Financeiro" subtitle="Visao geral de contas, fluxo, receitas e despesas" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Caixa aberto" value={cash ? brl(balance) : "Sem caixa"} accent="gold" />
        <StatCard label="A receber" value={brl(metrics.receivableOpen)} accent="success" />
        <StatCard label="A pagar" value={brl(metrics.payableDueSoon)} accent="danger" />
        <StatCard label="Despesas mes" value={brl(metrics.monthExpenses)} />
      </div>
      <Card className="mt-6">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Vendas finalizadas no PDV geram receitas pagas automaticamente. Contas canceladas nao
          entram na DRE. Despesas pagas podem reduzir o caixa quando houver caixa aberto.
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-3">
            <div>
              <h2 className="text-sm font-semibold">Movimentacao manual do caixa</h2>
              <p className="text-xs text-muted-foreground">
                Registre suprimentos e sangrias vinculados ao caixa aberto.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  min={0}
                  value={movementAmount}
                  onChange={(event) => setMovementAmount(Number(event.target.value))}
                  disabled={!cash || Boolean(busyAction)}
                />
              </div>
              <div>
                <Label>Observacao</Label>
                <Input
                  value={movementNote}
                  onChange={(event) => setMovementNote(event.target.value)}
                  placeholder="Motivo da movimentacao"
                  disabled={!cash || Boolean(busyAction)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={!cash || Boolean(busyAction)}
                onClick={() => runCashAction("supply")}
              >
                {busyAction === "supply" ? "Registrando..." : "Registrar suprimento"}
              </Button>
              <Button
                variant="outline"
                disabled={!cash || Boolean(busyAction)}
                onClick={() => runCashAction("withdrawal")}
              >
                {busyAction === "withdrawal" ? "Registrando..." : "Registrar sangria"}
              </Button>
            </div>
          </div>
          <div className="grid content-start gap-3">
            <div>
              <h2 className="text-sm font-semibold">Fechamento de caixa</h2>
              <p className="text-xs text-muted-foreground">
                Valor esperado em dinheiro: {cash ? brl(balance) : "sem caixa aberto"}.
              </p>
            </div>
            <CashClosingPanel
              cash={cash}
              disabled={Boolean(busyAction)}
              onCloseCash={(amount, note) => closeCash(amount, note)}
            />
          </div>
          {message && (
            <div className="rounded-md bg-muted p-2 text-xs text-muted-foreground lg:col-span-2">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
