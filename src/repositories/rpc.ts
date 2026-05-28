import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/types/database.types";
import type { RpcResult } from "@/types/business.types";

type RpcName =
  | "rpc_open_cash_register"
  | "rpc_close_cash_register"
  | "rpc_complete_sale"
  | "rpc_cancel_sale"
  | "rpc_register_cash_movement"
  | "rpc_receive_account"
  | "rpc_pay_account"
  | "rpc_receive_purchase"
  | "rpc_adjust_inventory"
  | "rpc_create_inventory_movement";

export class RepositoryError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export function requireSupabase() {
  if (!supabase) {
    throw new RepositoryError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase nao esta configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
}

export async function callRpc<T extends Record<string, unknown>>(
  name: RpcName,
  payload: unknown,
): Promise<T> {
  const client = requireSupabase();
  const { data, error } = await client.rpc(name, { payload: payload as Json });

  if (error) {
    throw new RepositoryError(error.code ?? "SUPABASE_RPC_ERROR", error.message, {
      hint: error.hint,
      details: error.details,
    });
  }

  const result = data as RpcResult<T>;

  if (!result.success) {
    throw new RepositoryError(result.code, result.message, result.details);
  }

  return result as T;
}
