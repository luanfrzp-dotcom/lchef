export type RoleId = "admin" | "manager" | "cashier" | "kitchen" | "finance" | "accountant";

export type Permission =
  | "dashboard:view"
  | "pdv:operate"
  | "orders:manage"
  | "kitchen:manage"
  | "catalog:manage"
  | "inventory:manage"
  | "purchases:manage"
  | "finance:manage"
  | "reports:view"
  | "accounting:view"
  | "settings:manage"
  | "users:manage"
  | "audit:view";

export type PaymentMethod = "cash" | "pix" | "credit_card" | "debit_card" | "voucher" | "courtesy";

export type OrderStatus = "new" | "preparing" | "ready" | "delivered" | "canceled";
export type CashStatus = "open" | "closed";
export type FinancialStatus = "open" | "paid" | "overdue" | "canceled";
export type PurchaseStatus = "order" | "received" | "paid" | "canceled";

export type User = {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  unitId?: string;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  stockMin: number;
  margin?: number;
  status: "active" | "inactive";
  recipeId?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  cost: number;
  expiresAt?: string;
  lot?: string;
};

export type RecipeItem = {
  inventoryItemId: string;
  quantity: number;
  unit: string;
};

export type Recipe = {
  id: string;
  productId: string;
  name: string;
  yieldQty: number;
  version: string;
  preparation: string;
  validityDays: number;
  desiredMargin: number;
  items: RecipeItem[];
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
};

export type Payment = {
  id: string;
  method: PaymentMethod;
  amount: number;
};

export type Order = {
  id: string;
  customerName?: string;
  channel: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  payments: Payment[];
  cashRegisterId: string;
  createdAt: string;
  canceledAt?: string;
  cancelReason?: string;
};

export type CashMovement = {
  id: string;
  type: "opening" | "sale" | "supply" | "withdrawal" | "closing" | "expense" | "receivable";
  amount: number;
  method?: PaymentMethod;
  note: string;
  orderId?: string;
  createdAt: string;
};

export type CashRegister = {
  id: string;
  unitId?: string;
  openedAt: string;
  openedBy: string;
  openingAmount: number;
  status: CashStatus;
  closedAt?: string;
  closedBy?: string;
  informedAmount?: number;
  expectedAmount?: number;
  difference?: number;
  movements: CashMovement[];
};

export type InventoryMovement = {
  id: string;
  inventoryItemId: string;
  productId?: string;
  type: "in" | "out" | "adjustment" | "loss" | "sale" | "production";
  quantity: number;
  unit: string;
  reason: string;
  createdAt: string;
};

export type FinancialRecord = {
  id: string;
  type: "revenue" | "expense";
  description: string;
  amount: number;
  status: FinancialStatus;
  category: string;
  costCenter: string;
  dueDate: string;
  competenceDate: string;
  paidAt?: string;
  sourceOrderId?: string;
  sourcePurchaseId?: string;
};

export type Supplier = {
  id: string;
  name: string;
  document: string;
  category: string;
  paymentTerms: string;
  status: "active" | "inactive";
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  averageTicket: number;
  lastPurchaseAt?: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  hiredAt: string;
  status: "active" | "inactive";
};

export type PurchaseItem = {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
};

export type Purchase = {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  status: PurchaseStatus;
  paymentStatus: "open" | "paid";
  paymentTerms: string;
  createdAt: string;
  receivedAt?: string;
  paidAt?: string;
  total: number;
  items: PurchaseItem[];
};

export type AuditLog = {
  id: string;
  createdAt: string;
  userId: string;
  action: string;
  details: string;
};

export type AppState = {
  users: User[];
  currentUserId?: string;
  units: string[];
  products: Product[];
  inventoryItems: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  recipes: Recipe[];
  suppliers: Supplier[];
  customers: Customer[];
  employees: Employee[];
  orders: Order[];
  cashRegisters: CashRegister[];
  financialRecords: FinancialRecord[];
  purchases: Purchase[];
  auditLogs: AuditLog[];
};

export type SaleInput = {
  clientRequestId?: string;
  customerName?: string;
  channel: string;
  items: Array<{ productId: string; quantity: number }>;
  discount?: number;
  serviceFee?: number;
  payments: Array<{ method: PaymentMethod; amount: number }>;
  userId: string;
};

export type DreSummary = {
  grossRevenue: number;
  discounts: number;
  fees: number;
  netRevenue: number;
  cmv: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  administrativeExpenses: number;
  commercialExpenses: number;
  payroll: number;
  marketing: number;
  taxes: number;
  ebitda: number;
  operatingProfit: number;
  netMargin: number;
};

export const ROLE_LABELS: Record<RoleId, string> = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Caixa",
  kitchen: "Cozinha/Producao",
  finance: "Financeiro",
  accountant: "Contador",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  credit_card: "Cartao de credito",
  debit_card: "Cartao de debito",
  voucher: "Voucher",
  courtesy: "Cortesia",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Novo",
  preparing: "Em preparo",
  ready: "Pronto",
  delivered: "Entregue",
  canceled: "Cancelado",
};

export const ROLE_PERMISSIONS: Record<RoleId, Permission[]> = {
  admin: [
    "dashboard:view",
    "pdv:operate",
    "orders:manage",
    "kitchen:manage",
    "catalog:manage",
    "inventory:manage",
    "purchases:manage",
    "finance:manage",
    "reports:view",
    "accounting:view",
    "settings:manage",
    "users:manage",
    "audit:view",
  ],
  manager: [
    "dashboard:view",
    "pdv:operate",
    "orders:manage",
    "kitchen:manage",
    "catalog:manage",
    "inventory:manage",
    "purchases:manage",
    "reports:view",
  ],
  cashier: ["dashboard:view", "pdv:operate", "orders:manage"],
  kitchen: ["kitchen:manage", "catalog:manage"],
  finance: ["dashboard:view", "finance:manage", "reports:view"],
  accountant: ["accounting:view", "reports:view"],
};

const routePermissions: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/pdv", permission: "pdv:operate" },
  { prefix: "/pedidos", permission: "orders:manage" },
  { prefix: "/cozinha", permission: "kitchen:manage" },
  { prefix: "/produtos", permission: "catalog:manage" },
  { prefix: "/fichas-tecnicas", permission: "catalog:manage" },
  { prefix: "/estoque", permission: "inventory:manage" },
  { prefix: "/compras", permission: "purchases:manage" },
  { prefix: "/fornecedores", permission: "purchases:manage" },
  { prefix: "/financeiro", permission: "finance:manage" },
  { prefix: "/contas-pagar", permission: "finance:manage" },
  { prefix: "/contas-receber", permission: "finance:manage" },
  { prefix: "/fluxo-caixa", permission: "finance:manage" },
  { prefix: "/dre", permission: "finance:manage" },
  { prefix: "/relatorios", permission: "reports:view" },
  { prefix: "/contador", permission: "accounting:view" },
  { prefix: "/configuracoes", permission: "settings:manage" },
  { prefix: "/usuarios", permission: "users:manage" },
  { prefix: "/auditoria", permission: "audit:view" },
];

export function hasPermission(user: User | undefined, permission: Permission) {
  if (!user || !user.active) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export function canAccessRoute(user: User | undefined, pathname: string) {
  if (!user || !user.active) return false;
  if (pathname === "/") return hasPermission(user, "dashboard:view");
  const match = routePermissions.find((rule) => pathname.startsWith(rule.prefix));
  return match ? hasPermission(user, match.permission) : true;
}

export function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function todayIso() {
  return new Date().toISOString();
}

export function calculateRecipeCost(recipe: Recipe, inventoryItems: InventoryItem[]) {
  return recipe.items.reduce((total, item) => {
    const inventory = inventoryItems.find((i) => i.id === item.inventoryItemId);
    return total + (inventory?.cost ?? 0) * item.quantity;
  }, 0);
}

export function calculateRecipeMetrics(
  recipe: Recipe,
  product: Product,
  inventoryItems: InventoryItem[],
) {
  const costTotal = calculateRecipeCost(recipe, inventoryItems);
  const costPerUnit = recipe.yieldQty > 0 ? costTotal / recipe.yieldQty : 0;
  const cmv = product.price > 0 ? (costPerUnit / product.price) * 100 : 0;
  const grossMargin = product.price > 0 ? ((product.price - costPerUnit) / product.price) * 100 : 0;
  const suggestedPrice =
    recipe.desiredMargin < 100 ? costPerUnit / (1 - recipe.desiredMargin / 100) : product.price;
  return { costTotal, costPerUnit, cmv, grossMargin, suggestedPrice };
}

export function getOpenCashRegister(state: AppState, unitId?: string) {
  return state.cashRegisters.find(
    (cash) => cash.status === "open" && (!unitId || !cash.unitId || cash.unitId === unitId),
  );
}

export function openCashRegister(state: AppState, userId: string, openingAmount: number) {
  if (getOpenCashRegister(state)) {
    throw new Error("Ja existe um caixa aberto.");
  }
  const now = todayIso();
  const cash: CashRegister = {
    id: makeId("cash"),
    openedAt: now,
    openedBy: userId,
    openingAmount,
    status: "open",
    movements: [
      {
        id: makeId("mov"),
        type: "opening",
        amount: openingAmount,
        method: "cash",
        note: "Abertura de caixa",
        createdAt: now,
      },
    ],
  };
  return addAudit(
    { ...state, cashRegisters: [cash, ...state.cashRegisters] },
    userId,
    "Abriu caixa",
    `Fundo inicial ${openingAmount.toFixed(2)}`,
  );
}

export function expectedCashAmount(cash: CashRegister) {
  return cash.movements.reduce((total, movement) => {
    if (movement.type === "opening" || movement.type === "supply") return total + movement.amount;
    if (movement.type === "withdrawal" || movement.type === "expense")
      return total - movement.amount;
    if (movement.type === "sale" && movement.method === "cash") return total + movement.amount;
    if (movement.type === "receivable" && movement.method === "cash")
      return total + movement.amount;
    return total;
  }, 0);
}

export function closeCashRegister(state: AppState, userId: string, informedAmount: number) {
  const openCash = getOpenCashRegister(state);
  if (!openCash) throw new Error("Nao ha caixa aberto.");
  const expectedAmount = expectedCashAmount(openCash);
  const closed: CashRegister = {
    ...openCash,
    status: "closed",
    closedAt: todayIso(),
    closedBy: userId,
    informedAmount,
    expectedAmount,
    difference: informedAmount - expectedAmount,
    movements: [
      ...openCash.movements,
      {
        id: makeId("mov"),
        type: "closing",
        amount: informedAmount,
        method: "cash",
        note: "Fechamento de caixa",
        createdAt: todayIso(),
      },
    ],
  };
  const next = {
    ...state,
    cashRegisters: state.cashRegisters.map((cash) => (cash.id === openCash.id ? closed : cash)),
  };
  return addAudit(
    next,
    userId,
    "Fechou caixa",
    `Informado ${informedAmount.toFixed(2)}; diferenca ${closed.difference?.toFixed(2)}`,
  );
}

export function addCashMovement(
  state: AppState,
  userId: string,
  type: "supply" | "withdrawal",
  amount: number,
  note: string,
) {
  const openCash = getOpenCashRegister(state);
  if (!openCash) throw new Error("Nao ha caixa aberto.");
  const movement: CashMovement = {
    id: makeId("mov"),
    type,
    amount,
    method: "cash",
    note,
    createdAt: todayIso(),
  };
  const next = {
    ...state,
    cashRegisters: state.cashRegisters.map((cash) =>
      cash.id === openCash.id ? { ...cash, movements: [...cash.movements, movement] } : cash,
    ),
  };
  return addAudit(
    next,
    userId,
    type === "supply" ? "Registrou suprimento" : "Registrou sangria",
    note,
  );
}

export function validateSale(state: AppState, input: SaleInput) {
  if (!getOpenCashRegister(state)) throw new Error("Abra o caixa antes de vender.");
  if (!input.items.length) throw new Error("Adicione ao menos um produto.");
  const totalPaid = input.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const subtotal = input.items.reduce((sum, item) => {
    const product = state.products.find((p) => p.id === item.productId);
    if (!product || product.status !== "active") throw new Error("Produto indisponivel.");
    if (item.quantity <= 0) throw new Error("Quantidade invalida.");
    return sum + product.price * item.quantity;
  }, 0);
  const total = subtotal - (input.discount ?? 0) + (input.serviceFee ?? 0);
  if (Math.abs(totalPaid - total) > 0.01)
    throw new Error("Pagamentos nao fecham com o total da venda.");
  for (const item of input.items) {
    const product = state.products.find((p) => p.id === item.productId);
    if (!product) continue;
    if (product.stock < 900 && product.stock - item.quantity < 0) {
      throw new Error(`${product.name} nao possui estoque suficiente.`);
    }
    const recipe = product.recipeId
      ? state.recipes.find((r) => r.id === product.recipeId)
      : undefined;
    if (recipe && product) {
      for (const ingredient of recipe.items) {
        const inventory = state.inventoryItems.find((i) => i.id === ingredient.inventoryItemId);
        const required = ingredient.quantity * item.quantity;
        if (inventory && inventory.quantity - required < 0) {
          throw new Error(`${inventory.name} ficaria negativo. Ajuste estoque ou producao.`);
        }
      }
    }
  }
}

export function finalizeSale(state: AppState, input: SaleInput) {
  validateSale(state, input);
  const openCash = getOpenCashRegister(state)!;
  const now = todayIso();
  const subtotal = input.items.reduce((sum, item) => {
    const product = state.products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);
  const discount = input.discount ?? 0;
  const serviceFee = input.serviceFee ?? 0;
  const total = subtotal - discount + serviceFee;
  const orderId = makeId("order");
  const orderItems: OrderItem[] = input.items.map((item) => {
    const product = state.products.find((p) => p.id === item.productId)!;
    return {
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      unitCost: product.cost,
    };
  });
  const order: Order = {
    id: orderId,
    customerName: input.customerName?.trim() || "Balcao",
    channel: input.channel,
    items: orderItems,
    subtotal,
    discount,
    serviceFee,
    total,
    status: "new",
    payments: input.payments.map((payment) => ({ ...payment, id: makeId("pay") })),
    cashRegisterId: openCash.id,
    createdAt: now,
  };
  const products = state.products.map((product) => {
    const item = input.items.find((i) => i.productId === product.id);
    if (!item || product.stock >= 900) return product;
    return { ...product, stock: product.stock - item.quantity };
  });
  const inventoryItems = state.inventoryItems.map((inventory) => {
    let consumed = 0;
    for (const item of input.items) {
      const product = state.products.find((p) => p.id === item.productId);
      const recipe = product?.recipeId
        ? state.recipes.find((r) => r.id === product.recipeId)
        : undefined;
      const ingredient = recipe?.items.find(
        (recipeItem) => recipeItem.inventoryItemId === inventory.id,
      );
      if (ingredient) consumed += ingredient.quantity * item.quantity;
    }
    return consumed > 0 ? { ...inventory, quantity: inventory.quantity - consumed } : inventory;
  });
  const inventoryMovements: InventoryMovement[] = [];
  for (const item of input.items) {
    const product = state.products.find((p) => p.id === item.productId);
    const recipe = product?.recipeId
      ? state.recipes.find((r) => r.id === product.recipeId)
      : undefined;
    if (recipe && product) {
      for (const ingredient of recipe.items) {
        inventoryMovements.push({
          id: makeId("inv_mov"),
          inventoryItemId: ingredient.inventoryItemId,
          productId: product.id,
          type: "sale",
          quantity: ingredient.quantity * item.quantity,
          unit: ingredient.unit,
          reason: `Venda ${order.id}`,
          createdAt: now,
        });
      }
    }
  }
  const movements = input.payments
    .filter((payment) => payment.method !== "courtesy")
    .map<CashMovement>((payment) => ({
      id: makeId("mov"),
      type: "sale",
      amount: payment.amount,
      method: payment.method,
      note: `Venda ${order.id}`,
      orderId: order.id,
      createdAt: now,
    }));
  const revenue: FinancialRecord = {
    id: makeId("fin"),
    type: "revenue",
    description: `Venda ${order.id}`,
    amount: total,
    status: "paid",
    category: "Vendas",
    costCenter: "Loja",
    dueDate: now.slice(0, 10),
    competenceDate: now.slice(0, 10),
    paidAt: now,
    sourceOrderId: order.id,
  };
  const next: AppState = {
    ...state,
    products,
    inventoryItems,
    inventoryMovements: [...inventoryMovements, ...state.inventoryMovements],
    orders: [order, ...state.orders],
    cashRegisters: state.cashRegisters.map((cash) =>
      cash.id === openCash.id ? { ...cash, movements: [...cash.movements, ...movements] } : cash,
    ),
    financialRecords: [revenue, ...state.financialRecords],
  };
  return addAudit(next, input.userId, "Criou venda", `${order.id} - ${total.toFixed(2)}`);
}

export function cancelOrder(state: AppState, userId: string, orderId: string, reason: string) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("Pedido nao encontrado.");
  if (order.status === "canceled") return state;
  const now = todayIso();
  const orders = state.orders.map((item) =>
    item.id === orderId
      ? { ...item, status: "canceled" as const, canceledAt: now, cancelReason: reason }
      : item,
  );
  const financialRecords = state.financialRecords.map((record) =>
    record.sourceOrderId === orderId ? { ...record, status: "canceled" as const } : record,
  );
  return addAudit(
    { ...state, orders, financialRecords },
    userId,
    "Cancelou venda",
    `${orderId} - ${reason}`,
  );
}

export function updateOrderStatus(
  state: AppState,
  userId: string,
  orderId: string,
  status: OrderStatus,
) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("Pedido nao encontrado.");
  if (order.status === "canceled") throw new Error("Pedido cancelado nao pode ser alterado.");
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    new: ["preparing", "canceled"],
    preparing: ["ready", "canceled"],
    ready: ["delivered", "canceled"],
    delivered: [],
    canceled: [],
  };
  if (!allowed[order.status].includes(status)) throw new Error("Mudanca de status invalida.");
  const orders = state.orders.map((item) => (item.id === orderId ? { ...item, status } : item));
  return addAudit(
    { ...state, orders },
    userId,
    "Alterou status do pedido",
    `${orderId} -> ${status}`,
  );
}

export function addInventoryMovement(
  state: AppState,
  userId: string,
  movement: Omit<InventoryMovement, "id" | "createdAt">,
) {
  const inventory = state.inventoryItems.find((item) => item.id === movement.inventoryItemId);
  if (!inventory) throw new Error("Insumo nao encontrado.");
  const signal = movement.type === "in" ? 1 : movement.type === "adjustment" ? 0 : -1;
  const quantity =
    movement.type === "adjustment"
      ? movement.quantity
      : inventory.quantity + signal * movement.quantity;
  if (quantity < 0) throw new Error("Movimentacao deixaria estoque negativo.");
  const newMovement: InventoryMovement = {
    ...movement,
    id: makeId("inv_mov"),
    createdAt: todayIso(),
  };
  const next = {
    ...state,
    inventoryItems: state.inventoryItems.map((item) =>
      item.id === inventory.id ? { ...item, quantity } : item,
    ),
    inventoryMovements: [newMovement, ...state.inventoryMovements],
  };
  return addAudit(
    next,
    userId,
    "Movimentou estoque",
    `${inventory.name}: ${movement.type} ${movement.quantity}${movement.unit}`,
  );
}

export function markFinancialRecordPaid(state: AppState, userId: string, id: string) {
  const record = state.financialRecords.find((item) => item.id === id);
  if (!record) throw new Error("Lancamento nao encontrado.");
  const paidAt = todayIso();
  const financialRecords = state.financialRecords.map((item) =>
    item.id === id ? { ...item, status: "paid" as const, paidAt } : item,
  );
  const openCash = getOpenCashRegister(state);
  const cashRegisters =
    openCash && (record.type === "expense" || record.type === "revenue")
      ? state.cashRegisters.map((cash) =>
          cash.id === openCash.id
            ? {
                ...cash,
                movements: [
                  ...cash.movements,
                  {
                    id: makeId("mov"),
                    type:
                      record.type === "expense" ? ("expense" as const) : ("receivable" as const),
                    amount: record.amount,
                    method: "cash" as const,
                    note: record.description,
                    createdAt: paidAt,
                  },
                ],
              }
            : cash,
        )
      : state.cashRegisters;
  return addAudit(
    { ...state, financialRecords, cashRegisters },
    userId,
    "Pagou/recebeu lancamento",
    record.description,
  );
}

export function receivePurchase(state: AppState, userId: string, purchaseId: string) {
  const purchase = state.purchases.find((item) => item.id === purchaseId);
  if (!purchase) throw new Error("Compra nao encontrada.");
  if (purchase.status === "canceled") throw new Error("Compra cancelada nao pode ser recebida.");
  if (purchase.status === "received" || purchase.status === "paid") return state;
  const now = todayIso();
  const inventoryItems = state.inventoryItems.map((inventory) => {
    const item = purchase.items.find(
      (purchaseItem) => purchaseItem.inventoryItemId === inventory.id,
    );
    if (!item) return inventory;
    return { ...inventory, quantity: inventory.quantity + item.quantity, cost: item.unitCost };
  });
  const movements: InventoryMovement[] = purchase.items.map((item) => ({
    id: makeId("inv_mov"),
    inventoryItemId: item.inventoryItemId,
    type: "in",
    quantity: item.quantity,
    unit: item.unit,
    reason: `Recebimento da compra ${purchase.invoiceNumber}`,
    createdAt: now,
  }));
  const financialRecord: FinancialRecord = {
    id: makeId("fin"),
    type: "expense",
    description: `Compra ${purchase.invoiceNumber} - ${purchase.supplierName}`,
    amount: purchase.total,
    status: "open",
    category: "Compras",
    costCenter: "Estoque",
    dueDate: now.slice(0, 10),
    competenceDate: now.slice(0, 10),
    sourcePurchaseId: purchase.id,
  };
  const next = {
    ...state,
    inventoryItems,
    inventoryMovements: [...movements, ...state.inventoryMovements],
    purchases: state.purchases.map((item) =>
      item.id === purchase.id ? { ...item, status: "received" as const, receivedAt: now } : item,
    ),
    financialRecords: state.financialRecords.some(
      (record) => record.sourcePurchaseId === purchase.id,
    )
      ? state.financialRecords
      : [financialRecord, ...state.financialRecords],
  };
  return addAudit(
    next,
    userId,
    "Recebeu compra",
    `${purchase.invoiceNumber} - ${purchase.total.toFixed(2)}`,
  );
}

export function payPurchase(state: AppState, userId: string, purchaseId: string) {
  const purchase = state.purchases.find((item) => item.id === purchaseId);
  if (!purchase) throw new Error("Compra nao encontrada.");
  if (purchase.status === "canceled") throw new Error("Compra cancelada nao pode ser paga.");
  const now = todayIso();
  const existingRecord = state.financialRecords.find(
    (record) => record.sourcePurchaseId === purchase.id,
  );
  const financialRecords = existingRecord
    ? state.financialRecords.map((record) =>
        record.id === existingRecord.id
          ? { ...record, status: "paid" as const, paidAt: now }
          : record,
      )
    : [
        {
          id: makeId("fin"),
          type: "expense" as const,
          description: `Compra ${purchase.invoiceNumber} - ${purchase.supplierName}`,
          amount: purchase.total,
          status: "paid" as const,
          category: "Compras",
          costCenter: "Estoque",
          dueDate: now.slice(0, 10),
          competenceDate: now.slice(0, 10),
          paidAt: now,
          sourcePurchaseId: purchase.id,
        },
        ...state.financialRecords,
      ];
  const openCash = getOpenCashRegister(state);
  const cashRegisters = openCash
    ? state.cashRegisters.map((cash) =>
        cash.id === openCash.id
          ? {
              ...cash,
              movements: [
                ...cash.movements,
                {
                  id: makeId("mov"),
                  type: "expense" as const,
                  amount: purchase.total,
                  method: "cash" as const,
                  note: `Pagamento da compra ${purchase.invoiceNumber}`,
                  createdAt: now,
                },
              ],
            }
          : cash,
      )
    : state.cashRegisters;
  const next = {
    ...state,
    financialRecords,
    cashRegisters,
    purchases: state.purchases.map((item) =>
      item.id === purchase.id
        ? { ...item, status: "paid" as const, paymentStatus: "paid" as const, paidAt: now }
        : item,
    ),
  };
  return addAudit(
    next,
    userId,
    "Pagou compra",
    `${purchase.invoiceNumber} - ${purchase.total.toFixed(2)}`,
  );
}

export function calculateDre(state: AppState): DreSummary {
  const validOrders = state.orders.filter((order) => order.status !== "canceled");
  const grossRevenue = validOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const discounts = validOrders.reduce((sum, order) => sum + order.discount, 0);
  const fees = validOrders.reduce((sum, order) => sum + order.serviceFee, 0);
  const netRevenue = grossRevenue - discounts + fees;
  const cmv = validOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.unitCost * item.quantity, 0),
    0,
  );
  const expenses = state.financialRecords.filter(
    (record) => record.type === "expense" && record.status !== "canceled",
  );
  const byCategory = (needle: string) =>
    expenses
      .filter((record) => record.category.toLowerCase().includes(needle))
      .reduce((sum, record) => sum + record.amount, 0);
  const payroll = byCategory("folha");
  const marketing = byCategory("marketing");
  const taxes = byCategory("imposto");
  const administrativeExpenses = byCategory("administr");
  const commercialExpenses = byCategory("comercial");
  const operatingExpenses = expenses.reduce((sum, record) => sum + record.amount, 0) - taxes;
  const grossProfit = netRevenue - cmv;
  const ebitda = grossProfit - operatingExpenses;
  const operatingProfit = ebitda - taxes;
  return {
    grossRevenue,
    discounts,
    fees,
    netRevenue,
    cmv,
    grossProfit,
    grossMargin: netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0,
    operatingExpenses,
    administrativeExpenses,
    commercialExpenses,
    payroll,
    marketing,
    taxes,
    ebitda,
    operatingProfit,
    netMargin: netRevenue > 0 ? (operatingProfit / netRevenue) * 100 : 0,
  };
}

export function cashFlowProjection(state: AppState) {
  const records = state.financialRecords
    .filter((record) => record.status !== "canceled")
    .map((record) => ({
      date: record.dueDate,
      description: record.description,
      inflow: record.type === "revenue" ? record.amount : 0,
      outflow: record.type === "expense" ? record.amount : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  let balance = state.cashRegisters
    .filter((cash) => cash.status === "closed")
    .reduce((sum, cash) => sum + (cash.expectedAmount ?? expectedCashAmount(cash)), 0);
  const openCash = getOpenCashRegister(state);
  if (openCash) balance += expectedCashAmount(openCash);
  return records.map((record) => {
    balance += record.inflow - record.outflow;
    return { ...record, balance };
  });
}

export function dashboardMetrics(state: AppState) {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const validOrders = state.orders.filter((order) => order.status !== "canceled");
  const todayOrders = validOrders.filter((order) => order.createdAt.startsWith(today));
  const monthOrders = validOrders.filter((order) => order.createdAt.startsWith(month));
  const monthExpenses = state.financialRecords
    .filter(
      (record) =>
        record.type === "expense" &&
        record.status !== "canceled" &&
        record.competenceDate.startsWith(month),
    )
    .reduce((sum, record) => sum + record.amount, 0);
  const dre = calculateDre(state);
  const totalMonth = monthOrders.reduce((sum, order) => sum + order.total, 0);
  return {
    revenueToday: todayOrders.reduce((sum, order) => sum + order.total, 0),
    revenueMonth: totalMonth,
    orderCount: monthOrders.length,
    averageTicket: monthOrders.length ? totalMonth / monthOrders.length : 0,
    grossProfit: dre.grossProfit,
    grossMargin: dre.grossMargin,
    cmv: dre.netRevenue > 0 ? (dre.cmv / dre.netRevenue) * 100 : 0,
    monthExpenses,
    payableDueSoon: state.financialRecords
      .filter((record) => record.type === "expense" && record.status === "open")
      .reduce((sum, record) => sum + record.amount, 0),
    receivableOpen: state.financialRecords
      .filter((record) => record.type === "revenue" && record.status === "open")
      .reduce((sum, record) => sum + record.amount, 0),
    criticalStock: state.inventoryItems.filter((item) => item.quantity <= item.minQuantity),
  };
}

export function addAudit(
  state: AppState,
  userId: string,
  action: string,
  details: string,
): AppState {
  return {
    ...state,
    auditLogs: [
      {
        id: makeId("audit"),
        createdAt: todayIso(),
        userId,
        action,
        details,
      },
      ...state.auditLogs,
    ],
  };
}
