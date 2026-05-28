import type {
  AppState,
  CashRegister,
  DreSummary,
  FinancialRecord,
  InventoryMovement,
  Order,
  OrderStatus,
  PaymentMethod,
  Permission,
  Product,
  Purchase,
  RoleId,
  SaleInput,
  User,
} from "@/lib/domain";

export type {
  AppState,
  CashRegister,
  DreSummary,
  FinancialRecord,
  InventoryMovement,
  Order,
  OrderStatus,
  PaymentMethod,
  Permission,
  Product,
  Purchase,
  RoleId,
  SaleInput,
  User,
};

export type RpcFailure = {
  success: false;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type RpcSuccess<T extends Record<string, unknown> = Record<string, unknown>> = {
  success: true;
  message?: string;
} & T;

export type RpcResult<T extends Record<string, unknown> = Record<string, unknown>> =
  | RpcSuccess<T>
  | RpcFailure;

export type CompleteSaleItemPayload = {
  product_id: string;
  quantity: number;
  unit_price?: number;
};

export type CompleteSalePaymentPayload = {
  method: PaymentMethod;
  amount: number;
  received?: boolean;
  due_date?: string;
};

export type CompleteSalePayload = {
  client_request_id: string;
  unit_id: string;
  customer_id?: string;
  customer_name?: string;
  channel: string;
  discount?: number;
  service_fee?: number;
  items: CompleteSaleItemPayload[];
  payments: CompleteSalePaymentPayload[];
};

export type CompleteSaleResult = {
  order_id: string;
  cash_register_id?: string;
  total: number;
  inventory_movements_count: number;
  financial_entries_count: number;
  payments_count?: number;
  idempotent?: boolean;
  warnings?: Array<{
    code: string;
    product_id?: string;
    product_name?: string;
    message: string;
  }>;
};

export type OpenCashRegisterPayload = {
  unit_id: string;
  opening_amount: number;
};

export type CloseCashRegisterPayload = {
  unit_id: string;
  cash_register_id?: string;
  informed_amount: number;
};

export type CashMovementPayload = {
  unit_id: string;
  type: "supply" | "withdrawal";
  amount: number;
  note: string;
};

export type CancelSalePayload = {
  order_id: string;
  reason: string;
};

export type AdjustInventoryPayload = {
  inventory_item_id: string;
  target_quantity?: number;
  quantity_delta?: number;
  unit_cost?: number;
  type?: "in" | "out" | "adjustment" | "loss" | "sale" | "production";
  reason: string;
  origin?: string;
  reference_id?: string;
  metadata?: Record<string, unknown>;
};

export type ReceiveAccountPayload = {
  unit_id: string;
  account_receivable_id: string;
  cash_register_id?: string;
  method?: PaymentMethod;
};

export type PayAccountPayload = {
  unit_id: string;
  account_payable_id: string;
  cash_register_id?: string;
  method?: PaymentMethod;
};

export type ReceivePurchasePayload = {
  purchase_id: string;
};

export type DashboardSnapshot = ReturnType<typeof import("@/lib/domain").dashboardMetrics>;
