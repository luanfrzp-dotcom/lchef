import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { ReceivePurchasePayload } from "@/types/business.types";
import { callRpc } from "./rpc";
import { demoRepository } from "./demo.repository";

export const purchasesRepository = {
  async receive(payload: ReceivePurchasePayload) {
    if (!isSupabaseConfigured) return demoRepository.receivePurchase(payload.purchase_id);
    return callRpc<{ purchase_id: string; inventory_movements_count: number }>(
      "rpc_receive_purchase",
      payload,
    );
  },
};
