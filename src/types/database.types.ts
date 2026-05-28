import type { RpcResult } from "./business.types";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type DbUser = {
  id: string;
  name: string;
  email: string;
  role_id: string;
  unit_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type DbUnit = {
  id: string;
  name: string;
  active: boolean;
};

export type DbProductCategory = {
  id: string;
  name: string;
};

export type DbProduct = {
  id: string;
  unit_id: string | null;
  category_id: string | null;
  name: string;
  type: string;
  price: number;
  cost: number;
  stock: number;
  stock_min: number;
  active: boolean;
  deleted_at: string | null;
};

export type DbInventoryItem = {
  id: string;
  unit_id: string | null;
  name: string;
  category: string;
  quantity: number;
  measure_unit: string;
  min_quantity: number;
  unit_cost: number;
  expires_at: string | null;
  lot: string | null;
  deleted_at: string | null;
};

export type DbRecipe = {
  id: string;
  product_id: string;
  name: string;
  yield_qty: number;
  version: string;
  preparation: string | null;
  validity_days: number;
  desired_margin: number;
  active: boolean;
  deleted_at: string | null;
};

export type DbRecipeItem = {
  id: string;
  recipe_id: string;
  inventory_item_id: string;
  quantity: number;
  measure_unit: string;
};

export type DbSupplier = {
  id: string;
  name: string;
  document: string | null;
  category: string | null;
  payment_terms: string | null;
  active: boolean;
};

export type DbCustomer = {
  id: string;
  name: string;
  phone: string | null;
  total_spent: number;
  average_ticket: number;
  last_purchase_at: string | null;
};

export type DbEmployee = {
  id: string;
  name: string;
  role: string;
  hired_at: string | null;
  status: string;
};

export type DbOrder = {
  id: string;
  unit_id: string | null;
  customer_id: string | null;
  customer_name: string | null;
  channel: string;
  status: string;
  subtotal: number;
  discount: number;
  service_fee: number;
  total: number;
  cash_register_id: string | null;
  cancel_reason: string | null;
  canceled_at: string | null;
  created_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
};

export type DbPayment = {
  id: string;
  order_id: string;
  method: string;
  amount: number;
  is_received: boolean;
  due_date: string | null;
};

export type DbCashRegister = {
  id: string;
  unit_id: string | null;
  opened_by: string | null;
  closed_by: string | null;
  opening_amount: number;
  status: string;
  opened_at: string;
  closed_at: string | null;
  informed_amount: number | null;
  expected_amount: number | null;
  difference: number | null;
};

export type DbCashMovement = {
  id: string;
  cash_register_id: string;
  order_id: string | null;
  type: string;
  method: string | null;
  amount: number;
  note: string | null;
  created_at: string;
};

export type DbInventoryMovement = {
  id: string;
  inventory_item_id: string;
  product_id: string | null;
  order_id: string | null;
  purchase_id: string | null;
  type: string;
  quantity: number;
  measure_unit: string;
  reason: string;
  created_at: string;
};

export type DbRevenue = {
  id: string;
  order_id: string | null;
  description: string;
  amount: number;
  status: string;
  competence_date: string;
  due_date: string;
  paid_at: string | null;
};

export type DbExpense = {
  id: string;
  purchase_id: string | null;
  description: string;
  amount: number;
  status: string;
  competence_date: string;
  due_date: string;
  paid_at: string | null;
};

export type DbAccountPayable = {
  id: string;
  expense_id: string | null;
  supplier_id: string | null;
  description: string;
  amount: number;
  status: string;
  competence_date: string;
  due_date: string;
  paid_at: string | null;
};

export type DbAccountReceivable = {
  id: string;
  revenue_id: string | null;
  customer_id: string | null;
  description: string;
  amount: number;
  status: string;
  competence_date: string;
  due_date: string;
  paid_at: string | null;
};

export type DbPurchase = {
  id: string;
  supplier_id: string | null;
  unit_id: string | null;
  invoice_number: string | null;
  status: string;
  payment_status: string;
  payment_terms: string | null;
  total: number;
  received_at: string | null;
  paid_at: string | null;
  created_at: string;
};

export type DbPurchaseItem = {
  id: string;
  purchase_id: string;
  inventory_item_id: string;
  quantity: number;
  measure_unit: string;
  unit_cost: number;
};

export type DbAuditLog = {
  id: string;
  user_id: string | null;
  unit_id: string | null;
  action: string;
  details: string | null;
  entity: string | null;
  entity_id: string | null;
  old_data: Json | null;
  new_data: Json | null;
  metadata: Json;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: Table<DbUser>;
      units: Table<DbUnit>;
      product_categories: Table<DbProductCategory>;
      products: Table<DbProduct>;
      inventory_items: Table<DbInventoryItem>;
      recipes: Table<DbRecipe>;
      recipe_items: Table<DbRecipeItem>;
      suppliers: Table<DbSupplier>;
      customers: Table<DbCustomer>;
      employees: Table<DbEmployee>;
      orders: Table<DbOrder>;
      order_items: Table<DbOrderItem>;
      payments: Table<DbPayment>;
      cash_registers: Table<DbCashRegister>;
      cash_movements: Table<DbCashMovement>;
      inventory_movements: Table<DbInventoryMovement>;
      revenues: Table<DbRevenue>;
      expenses: Table<DbExpense>;
      accounts_payable: Table<DbAccountPayable>;
      accounts_receivable: Table<DbAccountReceivable>;
      purchases: Table<DbPurchase>;
      purchase_items: Table<DbPurchaseItem>;
      audit_logs: Table<DbAuditLog>;
    };
    Views: Record<string, never>;
    Functions: {
      rpc_open_cash_register: { Args: { payload: Json }; Returns: RpcResult };
      rpc_close_cash_register: { Args: { payload: Json }; Returns: RpcResult };
      rpc_complete_sale: { Args: { payload: Json }; Returns: RpcResult };
      rpc_cancel_sale: { Args: { payload: Json }; Returns: RpcResult };
      rpc_register_cash_movement: { Args: { payload: Json }; Returns: RpcResult };
      rpc_receive_account: { Args: { payload: Json }; Returns: RpcResult };
      rpc_pay_account: { Args: { payload: Json }; Returns: RpcResult };
      rpc_receive_purchase: { Args: { payload: Json }; Returns: RpcResult };
      rpc_adjust_inventory: { Args: { payload: Json }; Returns: RpcResult };
      rpc_create_inventory_movement: { Args: { payload: Json }; Returns: RpcResult };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
