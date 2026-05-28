import type { CashRegister, FinancialRecord } from "@/lib/domain";
import { financialRepository } from "@/repositories/financial.repository";

export const financialService = {
  markPaid(record: FinancialRecord, unitId: string, openCash?: CashRegister) {
    return financialRepository.markPaid(record, unitId, openCash?.id);
  },
  payPurchase(purchaseId: string, unitId: string, openCash?: CashRegister) {
    return financialRepository.payPurchase(purchaseId, unitId, openCash?.id);
  },
};
