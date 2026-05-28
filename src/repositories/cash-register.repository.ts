import { isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  CashMovementPayload,
  CloseCashRegisterPayload,
  OpenCashRegisterPayload,
} from "@/types/business.types";
import { callRpc } from "./rpc";
import { demoRepository } from "./demo.repository";

export const cashRegisterRepository = {
  async open(payload: OpenCashRegisterPayload) {
    if (!isSupabaseConfigured) return demoRepository.openCashRegister(payload.opening_amount);
    return callRpc<{ cash_register_id: string; opening_amount: number }>(
      "rpc_open_cash_register",
      payload,
    );
  },
  async close(payload: CloseCashRegisterPayload) {
    if (!isSupabaseConfigured) return demoRepository.closeCashRegister(payload.informed_amount);
    return callRpc<{ cash_register_id: string; expected_amount: number; difference: number }>(
      "rpc_close_cash_register",
      payload,
    );
  },
  async registerMovement(payload: CashMovementPayload) {
    if (!isSupabaseConfigured) {
      return demoRepository.registerCashMovement(payload.type, payload.amount, payload.note);
    }
    return callRpc<{ cash_register_id: string; cash_movement_id: string }>(
      "rpc_register_cash_movement",
      payload,
    );
  },
};
