import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { AdjustInventoryPayload } from "@/types/business.types";
import { callRpc } from "./rpc";
import { demoRepository } from "./demo.repository";

export const inventoryRepository = {
  async adjust(payload: AdjustInventoryPayload) {
    if (!isSupabaseConfigured) {
      return demoRepository.moveInventory({
        inventoryItemId: payload.inventory_item_id,
        type: payload.type ?? "adjustment",
        quantity: Math.abs(payload.quantity_delta ?? payload.target_quantity ?? 0),
        unit: "un",
        reason: payload.reason,
      });
    }
    return callRpc<{ inventory_item_id: string; inventory_movement_id: string }>(
      "rpc_adjust_inventory",
      payload,
    );
  },
};
