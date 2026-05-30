import assert from "node:assert/strict";
import test from "node:test";
import { INITIAL_STATE } from "../src/lib/initial-data.ts";
import {
  addCashMovement,
  calculateDre,
  calculateRecipeMetrics,
  canAccessRoute,
  cashClosingSummary,
  closeCashRegister,
  expectedCashAmount,
  finalizeSale,
  getOpenCashRegister,
  openCashRegister,
  payPurchase,
  receivePurchase,
  cashFlowProjection,
  type AppState,
} from "../src/lib/domain.ts";

function freshState(): AppState {
  return structuredClone(INITIAL_STATE);
}

test("calcula custo, CMV, margem e preco sugerido da ficha tecnica", () => {
  const state = freshState();
  const product = state.products.find((item) => item.id === "prod-cappuccino")!;
  const recipe = state.recipes.find((item) => item.id === product.recipeId)!;
  const metrics = calculateRecipeMetrics(recipe, product, state.inventoryItems);

  assert.ok(metrics.costTotal > 0);
  assert.ok(metrics.costPerUnit > 0);
  assert.ok(metrics.cmv > 0);
  assert.ok(metrics.grossMargin > 0);
  assert.ok(metrics.suggestedPrice > metrics.costPerUnit);
});

test("abre e fecha caixa calculando valor esperado e diferenca", () => {
  let state = openCashRegister(freshState(), "usr-admin", 100);
  const openCash = getOpenCashRegister(state)!;

  assert.equal(openCash.status, "open");
  assert.equal(expectedCashAmount(openCash), 100);

  state = closeCashRegister(state, "usr-admin", 110);
  const closedCash = state.cashRegisters[0];

  assert.equal(closedCash.status, "closed");
  assert.equal(closedCash.expectedAmount, 100);
  assert.equal(closedCash.difference, 10);
});

test("fechamento de caixa separa dinheiro fisico dos meios digitais", () => {
  let state = openCashRegister(freshState(), "usr-cashier", 100);
  const product = state.products.find((item) => item.id === "prod-espresso")!;

  state = finalizeSale(state, {
    userId: "usr-cashier",
    channel: "balcao",
    items: [{ productId: product.id, quantity: 1 }],
    payments: [{ method: "cash", amount: product.price }],
  });
  state = finalizeSale(state, {
    userId: "usr-cashier",
    channel: "balcao",
    items: [{ productId: product.id, quantity: 1 }],
    payments: [{ method: "pix", amount: product.price }],
  });
  state = addCashMovement(state, "usr-cashier", "supply", 20, "Troco extra");
  state = addCashMovement(state, "usr-cashier", "withdrawal", 5, "Sangria parcial");

  const openCash = getOpenCashRegister(state)!;
  const summary = cashClosingSummary(openCash);
  const expectedCash = 100 + product.price + 20 - 5;

  assert.equal(summary.cashSales, product.price);
  assert.equal(summary.pixSales, product.price);
  assert.equal(summary.totalSales, product.price * 2);
  assert.equal(summary.expectedCash, expectedCash);
  assert.equal(expectedCashAmount(openCash), expectedCash);

  state = closeCashRegister(state, "usr-cashier", expectedCash + 2, "Conferido no turno");
  const closedCash = state.cashRegisters[0];

  assert.equal(closedCash.expectedAmount, expectedCash);
  assert.equal(closedCash.difference, 2);
  assert.equal(closedCash.closingSummary?.pixSales, product.price);
  assert.equal(closedCash.movements.at(-1)?.note, "Conferido no turno");
});

test("cria venda, registra pagamento, receita, caixa e baixa estoque por receita", () => {
  let state = openCashRegister(freshState(), "usr-cashier", 100);
  const cafeBefore = state.inventoryItems.find((item) => item.id === "inv-cafe")!.quantity;
  const product = state.products.find((item) => item.id === "prod-espresso")!;

  state = finalizeSale(state, {
    userId: "usr-cashier",
    channel: "balcao",
    customerName: "Cliente teste",
    items: [{ productId: product.id, quantity: 2 }],
    payments: [{ method: "cash", amount: product.price * 2 }],
  });

  assert.equal(state.orders.length, 1);
  assert.equal(state.orders[0].items[0].quantity, 2);
  assert.equal(state.financialRecords[0].type, "revenue");
  assert.equal(state.financialRecords[0].status, "paid");
  assert.equal(
    getOpenCashRegister(state)!.movements.some((movement) => movement.type === "sale"),
    true,
  );
  assert.equal(state.inventoryMovements.filter((movement) => movement.type === "sale").length, 1);
  assert.equal(
    state.inventoryItems.find((item) => item.id === "inv-cafe")!.quantity,
    cafeBefore - 0.024,
  );
});

test("impede venda que deixaria estoque negativo", () => {
  const state = openCashRegister(freshState(), "usr-cashier", 100);
  const product = state.products.find((item) => item.id === "prod-chocolates")!;

  assert.throws(
    () =>
      finalizeSale(state, {
        userId: "usr-cashier",
        channel: "balcao",
        items: [{ productId: product.id, quantity: 20 }],
        payments: [{ method: "pix", amount: product.price * 20 }],
      }),
    /estoque suficiente|ficaria negativo/,
  );
});

test("DRE usa vendas e ignora registros cancelados", () => {
  let state = openCashRegister(freshState(), "usr-cashier", 100);
  const product = state.products.find((item) => item.id === "prod-espresso")!;
  state = finalizeSale(state, {
    userId: "usr-cashier",
    channel: "balcao",
    items: [{ productId: product.id, quantity: 1 }],
    payments: [{ method: "pix", amount: product.price }],
  });

  const dre = calculateDre(state);
  assert.ok(dre.grossRevenue >= product.price);
  assert.ok(dre.netRevenue >= product.price);
  assert.ok(dre.cmv > 0);
  assert.equal(Number((dre.grossProfit - (dre.netRevenue - dre.cmv)).toFixed(2)), 0);
});

test("fluxo de caixa projeta entradas e saidas financeiras", () => {
  const state = freshState();
  const flow = cashFlowProjection(state);

  assert.ok(flow.length >= state.financialRecords.length);
  assert.ok(flow.some((row) => row.inflow > 0));
  assert.ok(flow.some((row) => row.outflow > 0));
});

test("permissoes basicas protegem rotas por perfil", () => {
  const state = freshState();
  const admin = state.users.find((user) => user.role === "admin");
  const cashier = state.users.find((user) => user.role === "cashier");
  const accountant = state.users.find((user) => user.role === "accountant");

  assert.equal(canAccessRoute(admin, "/usuarios"), true);
  assert.equal(canAccessRoute(cashier, "/pdv"), true);
  assert.equal(canAccessRoute(cashier, "/financeiro"), false);
  assert.equal(canAccessRoute(accountant, "/contador"), true);
  assert.equal(canAccessRoute(accountant, "/pdv"), false);
});

test("recebimento e pagamento de compra atualizam estoque e financeiro", () => {
  let state = openCashRegister(freshState(), "usr-manager", 100);
  const purchase = state.purchases.find((item) => item.status === "order")!;
  const item = purchase.items[0];
  const before = state.inventoryItems.find(
    (inventory) => inventory.id === item.inventoryItemId,
  )!.quantity;

  state = receivePurchase(state, "usr-manager", purchase.id);
  assert.equal(state.purchases.find((entry) => entry.id === purchase.id)!.status, "received");
  assert.equal(
    state.inventoryItems.find((inventory) => inventory.id === item.inventoryItemId)!.quantity,
    before + item.quantity,
  );
  assert.ok(
    state.financialRecords.some(
      (record) => record.sourcePurchaseId === purchase.id && record.type === "expense",
    ),
  );

  state = payPurchase(state, "usr-manager", purchase.id);
  assert.equal(state.purchases.find((entry) => entry.id === purchase.id)!.paymentStatus, "paid");
  assert.ok(getOpenCashRegister(state)!.movements.some((movement) => movement.type === "expense"));
});
