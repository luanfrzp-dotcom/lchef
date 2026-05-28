import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { FinancialRecord, PaymentMethod } from "@/lib/domain";
import { callRpc, requireSupabase } from "./rpc";
import { demoRepository } from "./demo.repository";

export const financialRepository = {
  async markPaid(
    record: FinancialRecord,
    unitId: string,
    cashRegisterId?: string,
    method: PaymentMethod = "cash",
  ) {
    if (!isSupabaseConfigured) return demoRepository.markPaid(record.id);

    const client = requireSupabase();
    if (record.type === "revenue") {
      const { data, error } = await client
        .from("accounts_receivable")
        .select("id")
        .eq("revenue_id", record.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return callRpc("rpc_receive_account", {
        unit_id: unitId,
        account_receivable_id: data?.id ?? record.id,
        cash_register_id: cashRegisterId,
        method,
      });
    }

    const { data, error } = await client
      .from("accounts_payable")
      .select("id")
      .eq("expense_id", record.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return callRpc("rpc_pay_account", {
      unit_id: unitId,
      account_payable_id: data?.id ?? record.id,
      cash_register_id: cashRegisterId,
      method,
    });
  },
  async payPurchase(purchaseId: string, unitId: string, cashRegisterId?: string) {
    if (!isSupabaseConfigured) return demoRepository.payPurchase(purchaseId);
    if (!supabase) return;

    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .select("id")
      .eq("purchase_id", purchaseId)
      .maybeSingle();
    if (expenseError) throw new Error(expenseError.message);
    if (!expense) throw new Error("Receba a compra antes de registra-la como paga.");

    const { data: payable, error: payableError } = await supabase
      .from("accounts_payable")
      .select("id")
      .eq("expense_id", expense.id)
      .maybeSingle();
    if (payableError) throw new Error(payableError.message);
    if (!payable) throw new Error("Conta a pagar da compra nao encontrada.");

    return callRpc("rpc_pay_account", {
      unit_id: unitId,
      account_payable_id: payable.id,
      cash_register_id: cashRegisterId,
      method: "cash",
    });
  },
};
