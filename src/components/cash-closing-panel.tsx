import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brl } from "@/components/ui-bits";
import { cashClosingSummary, type CashRegister } from "@/lib/domain";

type CashClosingPanelProps = {
  cash?: CashRegister;
  disabled?: boolean;
  blockedReason?: string;
  compact?: boolean;
  onCloseCash: (amount: number, note?: string) => Promise<void>;
};

const summaryRows = [
  ["Fundo inicial", "openingAmount"],
  ["Vendas dinheiro", "cashSales"],
  ["Recebimentos dinheiro", "cashReceivables"],
  ["Suprimentos", "supplies"],
  ["Sangrias", "withdrawals"],
  ["Despesas dinheiro", "cashExpenses"],
  ["PIX", "pixSales"],
  ["Credito", "creditCardSales"],
  ["Debito", "debitCardSales"],
  ["Voucher", "voucherSales"],
] as const;

function formatSigned(value: number) {
  if (value === 0) return brl(0);
  return `${value > 0 ? "+" : "-"} ${brl(Math.abs(value))}`;
}

export function CashClosingPanel({
  cash,
  disabled = false,
  blockedReason,
  compact = false,
  onCloseCash,
}: CashClosingPanelProps) {
  const summary = useMemo(() => (cash ? cashClosingSummary(cash) : undefined), [cash]);
  const [informedAmount, setInformedAmount] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!cash || !summary) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Nao ha caixa aberto para fechamento.
      </div>
    );
  }

  const parsedAmount = Number(informedAmount);
  const hasAmount = informedAmount.trim() !== "";
  const invalidAmount = !hasAmount || Number.isNaN(parsedAmount) || parsedAmount < 0;
  const difference = hasAmount && !invalidAmount ? parsedAmount - summary.expectedCash : 0;
  const canClose = !disabled && !blockedReason && !invalidAmount && confirmed && !busy;
  const differenceTone =
    Math.abs(difference) < 0.01
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-800";

  async function handleClose() {
    if (busy) return;
    if (blockedReason) {
      setMessage(blockedReason);
      return;
    }
    if (invalidAmount) {
      setMessage("Informe o valor contado em dinheiro.");
      return;
    }
    if (!confirmed) {
      setMessage("Confirme a conferencia antes de fechar o caixa.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await onCloseCash(parsedAmount, note.trim() || "Fechamento de caixa conferido");
      setInformedAmount("");
      setNote("");
      setConfirmed(false);
      setMessage("Caixa fechado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel fechar o caixa.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Dinheiro esperado</div>
          <div className="mt-1 text-xl font-semibold text-[color:var(--primary)]">
            {brl(summary.expectedCash)}
          </div>
        </div>
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Vendas totais</div>
          <div className="mt-1 text-xl font-semibold">{brl(summary.totalSales)}</div>
        </div>
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Outros meios</div>
          <div className="mt-1 text-xl font-semibold">{brl(summary.totalNonCashSales)}</div>
        </div>
      </div>

      {!compact && (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {summaryRows.map(([label, key]) => (
            <div key={key} className="rounded-md border px-3 py-2">
              <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
              <div className="mt-1 text-sm font-semibold">{brl(summary[key])}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-[160px_1fr]">
        <div>
          <Label>Valor contado</Label>
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            value={informedAmount}
            onChange={(event) => setInformedAmount(event.target.value)}
            disabled={disabled || busy}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label>Observacao do fechamento</Label>
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={disabled || busy}
            placeholder="Ex.: conferido por Renata"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setInformedAmount(summary.expectedCash.toFixed(2))}
          disabled={disabled || busy}
        >
          Usar valor esperado
        </Button>
        <Badge variant="outline" className={differenceTone}>
          Diferenca: {formatSigned(difference)}
        </Badge>
        {Math.abs(difference) >= 0.01 && hasAmount && !invalidAmount && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            Ha divergencia para revisar.
          </span>
        )}
      </div>

      <label className="flex items-start gap-2 rounded-md border bg-muted/20 p-3 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          disabled={disabled || busy}
          className="mt-1"
        />
        <span>Conferi os valores do caixa e quero fechar este turno.</span>
      </label>

      {blockedReason && (
        <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">{blockedReason}</div>
      )}
      {message && (
        <div className="rounded-md bg-muted p-2 text-xs text-muted-foreground">{message}</div>
      )}

      <Button
        type="button"
        className="bg-[color:var(--primary)] hover:bg-[color:var(--primary)]/90"
        disabled={!canClose}
        onClick={handleClose}
      >
        {busy ? (
          "Fechando caixa..."
        ) : (
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Fechar caixa
          </span>
        )}
      </Button>
    </div>
  );
}
