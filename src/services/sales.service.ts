import { makeId, type Product, type SaleInput } from "@/lib/domain";
import { salesRepository } from "@/repositories/sales.repository";
import type { CompleteSalePayload } from "@/types/business.types";

export function buildCompleteSalePayload(
  input: Omit<SaleInput, "userId">,
  products: Product[],
  unitId: string,
): CompleteSalePayload {
  const subtotal = input.items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const total = subtotal - (input.discount ?? 0) + (input.serviceFee ?? 0);

  return {
    client_request_id: input.clientRequestId ?? makeId("sale_request"),
    unit_id: unitId,
    customer_name: input.customerName,
    channel: input.channel,
    discount: input.discount ?? 0,
    service_fee: input.serviceFee ?? 0,
    items: input.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return {
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: product?.price,
      };
    }),
    payments: input.payments.map((payment) => ({
      method: payment.method,
      amount: payment.amount,
      received: true,
    })),
  };
}

export const salesService = {
  async completeSale(input: Omit<SaleInput, "userId">, products: Product[], unitId: string) {
    if (!input.items.length) {
      throw new Error("Adicione ao menos um produto antes de finalizar a venda.");
    }

    if (!input.payments.length) {
      throw new Error("Selecione a forma de pagamento.");
    }

    const payload = buildCompleteSalePayload(input, products, unitId);
    const paid = payload.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const subtotal = input.items.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
    const total = subtotal - (input.discount ?? 0) + (input.serviceFee ?? 0);

    if (total < 0 || (input.discount ?? 0) < 0 || (input.serviceFee ?? 0) < 0) {
      throw new Error("Revise desconto e taxa antes de finalizar a venda.");
    }

    if (Math.abs(paid - total) > 0.01) {
      throw new Error("Pagamentos nao fecham com o total da venda.");
    }

    return salesRepository.completeSale(payload);
  },
  cancelSale(orderId: string, reason: string) {
    return salesRepository.cancelSale({ order_id: orderId, reason });
  },
};
