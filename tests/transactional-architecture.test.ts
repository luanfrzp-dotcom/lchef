import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationFiles = readdirSync("supabase/migrations")
  .filter((file) => file.endsWith(".sql"))
  .sort();
const rpcMigration = migrationFiles
  .map((file) => readFileSync(`supabase/migrations/${file}`, "utf8"))
  .join("\n");
const latestMigration = readFileSync(`supabase/migrations/${migrationFiles.at(-1)}`, "utf8");
const salesServiceSource = readFileSync("src/services/sales.service.ts", "utf8");
const pdvSource = readFileSync("src/routes/_app/pdv.tsx", "utf8");

test("migration cria RPCs transacionais obrigatorias", () => {
  [
    "rpc_open_cash_register",
    "rpc_close_cash_register",
    "rpc_complete_sale",
    "rpc_cancel_sale",
    "rpc_register_cash_movement",
    "rpc_receive_account",
    "rpc_pay_account",
    "rpc_receive_purchase",
    "rpc_adjust_inventory",
    "rpc_create_inventory_movement",
  ].forEach((functionName) => {
    assert.match(rpcMigration, new RegExp(`create or replace function public\\.${functionName}`));
    assert.match(
      rpcMigration,
      new RegExp(`grant execute on function public\\.${functionName}\\(jsonb\\) to authenticated`),
    );
  });
});

test("rpc_complete_sale cobre idempotencia, caixa, estoque, financeiro e auditoria", () => {
  const requiredFragments = [
    "idx_orders_user_idempotency",
    "NO_OPEN_CASH_REGISTER",
    "INSUFFICIENT_STOCK",
    "insert into public.orders",
    "insert into public.order_items",
    "insert into public.payments",
    "insert into public.revenues",
    "insert into public.accounts_receivable",
    "insert into public.cash_movements",
    "insert into public.inventory_movements",
    "order.completed",
  ];

  requiredFragments.forEach((fragment) => assert.match(rpcMigration, new RegExp(fragment)));
});

test("cancelamento estorna estoque, financeiro e registra auditoria", () => {
  [
    "order.canceled",
    "Estorno por cancelamento",
    "set status = 'canceled'",
    "inventory_movements",
  ].forEach((fragment) => assert.match(rpcMigration, new RegExp(fragment)));
});

test("policies RLS usam auth.uid, perfil e unidade", () => {
  [
    "enable row level security",
    "auth.uid()",
    "current_app_user_id",
    "public.same_unit",
    "public.has_permission",
    "public.is_admin",
  ].forEach((fragment) =>
    assert.match(rpcMigration, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))),
  );
});

test("service de venda gera payload idempotente e delega para repository", () => {
  assert.match(
    salesServiceSource,
    /client_request_id: input\.clientRequestId \?\? makeId\("sale_request"\)/,
  );
  assert.match(salesServiceSource, /salesRepository\.completeSale\(payload\)/);
  assert.match(salesServiceSource, /Pagamentos nao fecham com o total da venda/);
  assert.match(salesServiceSource, /Selecione a forma de pagamento/);
});

test("PDV bloqueia duplo clique e exige pagamento selecionado", () => {
  assert.match(pdvSource, /isFinishing/);
  assert.match(pdvSource, /setClientRequestId\(makeId\("sale_request"\)\)/);
  assert.match(pdvSource, /Selecione a forma de pagamento/);
  assert.match(pdvSource, /Finalizar compra/);
});

test("RPC permite venda sem ficha tecnica com aviso e sem quebrar financeiro", () => {
  assert.match(rpcMigration, /v_warnings/);
  assert.match(rpcMigration, /sem ficha tecnica ativa; estoque de ingredientes nao foi baixado/i);
  assert.doesNotMatch(latestMigration, /raise exception 'Ficha tecnica ativa ausente/);
  assert.match(rpcMigration, /NO_PAYMENT_METHOD/);
});
