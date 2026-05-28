import { isSupabaseConfigured } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/domain";
import type {
  CancelSalePayload,
  CompleteSalePayload,
  CompleteSaleResult,
} from "@/types/business.types";
import { callRpc } from "./rpc";
import { demoRepository } from "./demo.repository";

export const salesRepository = {
  async completeSale(payload: CompleteSalePayload) {
    if (!isSupabaseConfigured) {
      await demoRepository.completeSale({
        customerName: payload.customer_name,
        channel: payload.channel,
        discount: payload.discount,
        serviceFee: payload.service_fee,
        items: payload.items.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
        })),
        payments: payload.payments.map((payment) => ({
          method: payment.method,
          amount: payment.amount,
        })),
      });
      return { success: true, total: 0, order_id: "demo" };
    }

    return callRpc<CompleteSaleResult>("rpc_complete_sale", payload);
  },
  async cancelSale(payload: CancelSalePayload) {
    if (!isSupabaseConfigured) return demoRepository.cancelSale(payload.order_id, payload.reason);
    return callRpc<{ order_id: string; inventory_movements_count: number }>(
      "rpc_cancel_sale",
      payload,
    );
  },
  async changeOrderStatus(orderId: string, status: OrderStatus) {
    if (!isSupabaseConfigured) return demoRepository.changeOrderStatus(orderId, status);
    if (!supabase) return;
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) throw new Error(error.message);
  },
};
