import { supabase } from "@/lib/supabase/client";
import type {
  AppState,
  CashMovement,
  CashStatus,
  FinancialRecord,
  FinancialStatus,
  InventoryMovement,
  OrderStatus,
  PaymentMethod,
  Product,
  PurchaseStatus,
  Recipe,
  RoleId,
} from "@/lib/domain";
import { demoRepository } from "./demo.repository";

async function required<T>(
  promise: PromiseLike<{ data: T | null; error: { message: string } | null }>,
) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data;
}

export const appDataRepository = {
  async getSnapshot(): Promise<AppState> {
    if (!supabase) return demoRepository.getState();

    const [
      users,
      units,
      categories,
      products,
      inventoryItems,
      recipes,
      recipeItems,
      suppliers,
      customers,
      employees,
      orders,
      orderItems,
      payments,
      cashRegisters,
      cashMovements,
      inventoryMovements,
      revenues,
      expenses,
      purchases,
      purchaseItems,
      auditLogs,
    ] = await Promise.all([
      required(supabase.from("users").select("*").is("deleted_at", null)),
      required(supabase.from("units").select("*").is("deleted_at", null)),
      required(supabase.from("product_categories").select("*").is("deleted_at", null)),
      required(supabase.from("products").select("*").is("deleted_at", null)),
      required(supabase.from("inventory_items").select("*").is("deleted_at", null)),
      required(supabase.from("recipes").select("*").is("deleted_at", null)),
      required(supabase.from("recipe_items").select("*")),
      required(supabase.from("suppliers").select("*").is("deleted_at", null)),
      required(supabase.from("customers").select("*").is("deleted_at", null)),
      required(supabase.from("employees").select("*").is("deleted_at", null)),
      required(
        supabase
          .from("orders")
          .select("*")
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
      ),
      required(supabase.from("order_items").select("*")),
      required(supabase.from("payments").select("*")),
      required(
        supabase.from("cash_registers").select("*").order("opened_at", { ascending: false }),
      ),
      required(
        supabase.from("cash_movements").select("*").order("created_at", { ascending: false }),
      ),
      required(
        supabase.from("inventory_movements").select("*").order("created_at", { ascending: false }),
      ),
      required(supabase.from("revenues").select("*").is("deleted_at", null)),
      required(supabase.from("expenses").select("*").is("deleted_at", null)),
      required(
        supabase
          .from("purchases")
          .select("*")
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
      ),
      required(supabase.from("purchase_items").select("*")),
      required(supabase.from("audit_logs").select("*").order("created_at", { ascending: false })),
    ]);

    const categoryName = new Map(
      (categories ?? []).map((category) => [category.id, category.name]),
    );
    const recipeByProduct = new Map(
      (recipes ?? []).map((recipe) => [recipe.product_id, recipe.id]),
    );
    const inventoryName = new Map((inventoryItems ?? []).map((item) => [item.id, item.name]));
    const supplierName = new Map((suppliers ?? []).map((supplier) => [supplier.id, supplier.name]));
    const itemsByOrder = new Map<string, typeof orderItems>();
    const paymentsByOrder = new Map<string, typeof payments>();
    const movementsByCash = new Map<string, CashMovement[]>();
    const itemsByRecipe = new Map<string, typeof recipeItems>();
    const itemsByPurchase = new Map<string, typeof purchaseItems>();

    for (const item of orderItems ?? []) {
      itemsByOrder.set(item.order_id, [...(itemsByOrder.get(item.order_id) ?? []), item]);
    }
    for (const payment of payments ?? []) {
      paymentsByOrder.set(payment.order_id, [
        ...(paymentsByOrder.get(payment.order_id) ?? []),
        payment,
      ]);
    }
    for (const movement of cashMovements ?? []) {
      const mapped: CashMovement = {
        id: movement.id,
        type: movement.type as CashMovement["type"],
        amount: Number(movement.amount),
        method: movement.method as PaymentMethod | undefined,
        note: movement.note ?? "",
        orderId: movement.order_id ?? undefined,
        createdAt: movement.created_at,
      };
      movementsByCash.set(movement.cash_register_id, [
        ...(movementsByCash.get(movement.cash_register_id) ?? []),
        mapped,
      ]);
    }
    for (const item of recipeItems ?? []) {
      itemsByRecipe.set(item.recipe_id, [...(itemsByRecipe.get(item.recipe_id) ?? []), item]);
    }
    for (const item of purchaseItems ?? []) {
      itemsByPurchase.set(item.purchase_id, [
        ...(itemsByPurchase.get(item.purchase_id) ?? []),
        item,
      ]);
    }

    return {
      users: (users ?? []).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_id as RoleId,
        active: user.active,
      })),
      currentUserId: undefined,
      units: (units ?? []).map((unit) => unit.name),
      products: (products ?? []).map<Product>((product) => ({
        id: product.id,
        name: product.name,
        category: categoryName.get(product.category_id ?? "") ?? "Sem categoria",
        price: Number(product.price),
        cost: Number(product.cost),
        stock: Number(product.stock),
        stockMin: Number(product.stock_min),
        status: product.active ? "active" : "inactive",
        recipeId: recipeByProduct.get(product.id),
      })),
      inventoryItems: (inventoryItems ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: Number(item.quantity),
        unit: item.measure_unit,
        minQuantity: Number(item.min_quantity),
        cost: Number(item.unit_cost),
        expiresAt: item.expires_at ?? undefined,
        lot: item.lot ?? undefined,
      })),
      inventoryMovements: (inventoryMovements ?? []).map<InventoryMovement>((movement) => ({
        id: movement.id,
        inventoryItemId: movement.inventory_item_id,
        productId: movement.product_id ?? undefined,
        type: movement.type as InventoryMovement["type"],
        quantity: Number(movement.quantity),
        unit: movement.measure_unit,
        reason: movement.reason,
        createdAt: movement.created_at,
      })),
      recipes: (recipes ?? []).map<Recipe>((recipe) => ({
        id: recipe.id,
        productId: recipe.product_id,
        name: recipe.name,
        yieldQty: Number(recipe.yield_qty),
        version: recipe.version,
        preparation: recipe.preparation ?? "",
        validityDays: recipe.validity_days,
        desiredMargin: Number(recipe.desired_margin),
        items: (itemsByRecipe.get(recipe.id) ?? []).map((item) => ({
          inventoryItemId: item.inventory_item_id,
          quantity: Number(item.quantity),
          unit: item.measure_unit,
        })),
      })),
      suppliers: (suppliers ?? []).map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        document: supplier.document ?? "",
        category: supplier.category ?? "",
        paymentTerms: supplier.payment_terms ?? "",
        status: supplier.active ? "active" : "inactive",
      })),
      customers: (customers ?? []).map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone ?? "",
        totalSpent: Number(customer.total_spent),
        averageTicket: Number(customer.average_ticket),
        lastPurchaseAt: customer.last_purchase_at ?? undefined,
      })),
      employees: (employees ?? []).map((employee) => ({
        id: employee.id,
        name: employee.name,
        role: employee.role,
        hiredAt: employee.hired_at ?? "",
        status: employee.status === "inactive" ? "inactive" : "active",
      })),
      orders: (orders ?? []).map((order) => ({
        id: order.id,
        customerName: order.customer_name ?? undefined,
        channel: order.channel,
        items: (itemsByOrder.get(order.id) ?? []).map((item) => ({
          productId: item.product_id ?? "",
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          unitCost: Number(item.unit_cost),
        })),
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        serviceFee: Number(order.service_fee),
        total: Number(order.total),
        status: order.status as OrderStatus,
        payments: (paymentsByOrder.get(order.id) ?? []).map((payment) => ({
          id: payment.id,
          method: payment.method as PaymentMethod,
          amount: Number(payment.amount),
        })),
        cashRegisterId: order.cash_register_id ?? "",
        createdAt: order.created_at,
        canceledAt: order.canceled_at ?? undefined,
        cancelReason: order.cancel_reason ?? undefined,
      })),
      cashRegisters: (cashRegisters ?? []).map((cash) => ({
        id: cash.id,
        openedAt: cash.opened_at,
        openedBy: cash.opened_by ?? "",
        openingAmount: Number(cash.opening_amount),
        status: cash.status as CashStatus,
        closedAt: cash.closed_at ?? undefined,
        closedBy: cash.closed_by ?? undefined,
        informedAmount: cash.informed_amount ?? undefined,
        expectedAmount: cash.expected_amount ?? undefined,
        difference: cash.difference ?? undefined,
        movements: movementsByCash.get(cash.id) ?? [],
      })),
      financialRecords: [
        ...(revenues ?? []).map<FinancialRecord>((record) => ({
          id: record.id,
          type: "revenue",
          description: record.description,
          amount: Number(record.amount),
          status: record.status as FinancialStatus,
          category: "Receitas",
          costCenter: "Loja",
          dueDate: record.due_date,
          competenceDate: record.competence_date,
          paidAt: record.paid_at ?? undefined,
          sourceOrderId: record.order_id ?? undefined,
        })),
        ...(expenses ?? []).map<FinancialRecord>((record) => ({
          id: record.id,
          type: "expense",
          description: record.description,
          amount: Number(record.amount),
          status: record.status as FinancialStatus,
          category: "Despesas",
          costCenter: "Loja",
          dueDate: record.due_date,
          competenceDate: record.competence_date,
          paidAt: record.paid_at ?? undefined,
          sourcePurchaseId: record.purchase_id ?? undefined,
        })),
      ],
      purchases: (purchases ?? []).map((purchase) => ({
        id: purchase.id,
        supplierId: purchase.supplier_id ?? "",
        supplierName: supplierName.get(purchase.supplier_id ?? "") ?? "Fornecedor",
        invoiceNumber: purchase.invoice_number ?? "",
        status: purchase.status as PurchaseStatus,
        paymentStatus: purchase.payment_status === "paid" ? "paid" : "open",
        paymentTerms: purchase.payment_terms ?? "",
        createdAt: purchase.created_at,
        receivedAt: purchase.received_at ?? undefined,
        paidAt: purchase.paid_at ?? undefined,
        total: Number(purchase.total),
        items: (itemsByPurchase.get(purchase.id) ?? []).map((item) => ({
          inventoryItemId: item.inventory_item_id,
          name: inventoryName.get(item.inventory_item_id) ?? "Insumo",
          quantity: Number(item.quantity),
          unit: item.measure_unit,
          unitCost: Number(item.unit_cost),
        })),
      })),
      auditLogs: (auditLogs ?? []).map((log) => ({
        id: log.id,
        createdAt: log.created_at,
        userId: log.user_id ?? "",
        action: log.action,
        details: log.details ?? "",
      })),
    };
  },
};
