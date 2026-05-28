import { purchasesRepository } from "@/repositories/purchases.repository";

export const purchaseService = {
  receive(purchaseId: string) {
    return purchasesRepository.receive({ purchase_id: purchaseId });
  },
};
