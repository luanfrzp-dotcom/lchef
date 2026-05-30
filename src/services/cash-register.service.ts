import { cashRegisterRepository } from "@/repositories/cash-register.repository";

export const cashRegisterService = {
  open(unitId: string, openingAmount: number) {
    return cashRegisterRepository.open({ unit_id: unitId, opening_amount: openingAmount });
  },
  close(unitId: string, informedAmount: number, cashRegisterId?: string, note?: string) {
    return cashRegisterRepository.close({
      unit_id: unitId,
      cash_register_id: cashRegisterId,
      informed_amount: informedAmount,
      closing_note: note,
    });
  },
  supply(unitId: string, amount: number, note: string) {
    return cashRegisterRepository.registerMovement({
      unit_id: unitId,
      type: "supply",
      amount,
      note,
    });
  },
  withdraw(unitId: string, amount: number, note: string) {
    return cashRegisterRepository.registerMovement({
      unit_id: unitId,
      type: "withdrawal",
      amount,
      note,
    });
  },
};
