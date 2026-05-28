import type { InventoryMovement } from "@/lib/domain";
import { inventoryRepository } from "@/repositories/inventory.repository";

export const inventoryService = {
  adjust(movement: Omit<InventoryMovement, "id" | "createdAt">) {
    const quantity_delta =
      movement.type === "in"
        ? movement.quantity
        : movement.type === "adjustment"
          ? undefined
          : -movement.quantity;
    return inventoryRepository.adjust({
      inventory_item_id: movement.inventoryItemId,
      quantity_delta,
      target_quantity: movement.type === "adjustment" ? movement.quantity : undefined,
      type: movement.type,
      reason: movement.reason,
      origin: "frontend",
    });
  },
};
