create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.roles (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id text not null references public.roles(id) on delete cascade,
  permission_id text not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  address text,
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role_id text not null references public.roles(id),
  unit_id uuid references public.units(id),
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create or replace function public.current_role_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role_id from public.users where id = auth.uid() and active = true and deleted_at is null limit 1;
$$;

create or replace function public.has_permission(permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_permissions rp
    where rp.role_id = public.current_role_id()
      and rp.permission_id = permission
  );
$$;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id),
  category_id uuid references public.product_categories(id),
  name text not null,
  sku text unique,
  type text not null default 'finished' check (type in ('finished', 'ingredient', 'service')),
  price numeric(12,2) not null default 0 check (price >= 0),
  cost numeric(12,4) not null default 0 check (cost >= 0),
  stock numeric(12,3) not null default 0,
  stock_min numeric(12,3) not null default 0,
  active boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id),
  name text not null,
  category text not null,
  quantity numeric(12,3) not null default 0,
  measure_unit text not null,
  min_quantity numeric(12,3) not null default 0,
  unit_cost numeric(12,4) not null default 0,
  expires_at date,
  lot text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  yield_qty numeric(12,3) not null default 1 check (yield_qty > 0),
  version text not null default 'v1.0',
  preparation text,
  validity_days integer not null default 0,
  desired_margin numeric(5,2) not null default 65,
  active boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.recipe_items (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id),
  quantity numeric(12,4) not null check (quantity > 0),
  measure_unit text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  category text,
  payment_terms text,
  active boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id),
  unit_id uuid references public.units(id),
  invoice_number text,
  status text not null default 'order' check (status in ('order', 'received', 'paid', 'canceled')),
  payment_status text not null default 'open' check (payment_status in ('open', 'paid', 'canceled')),
  payment_terms text,
  total numeric(12,2) not null default 0,
  received_at timestamptz,
  paid_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id),
  quantity numeric(12,3) not null check (quantity > 0),
  measure_unit text not null,
  unit_cost numeric(12,4) not null default 0,
  total numeric(12,2) generated always as (round(quantity * unit_cost, 2)) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  document text,
  total_spent numeric(12,2) not null default 0,
  average_ticket numeric(12,2) not null default 0,
  last_purchase_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.cash_registers (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id),
  opened_by uuid references public.users(id),
  closed_by uuid references public.users(id),
  opening_amount numeric(12,2) not null default 0,
  status text not null default 'open' check (status in ('open', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  informed_amount numeric(12,2),
  expected_amount numeric(12,2),
  difference numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id),
  customer_id uuid references public.customers(id),
  customer_name text,
  channel text not null default 'balcao',
  status text not null default 'new' check (status in ('new', 'preparing', 'ready', 'delivered', 'canceled')),
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  cash_register_id uuid references public.cash_registers(id),
  cancel_reason text,
  canceled_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  unit_cost numeric(12,4) not null default 0,
  total numeric(12,2) generated always as (round(quantity * unit_price, 2)) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null check (method in ('cash', 'pix', 'credit_card', 'debit_card', 'voucher', 'courtesy')),
  amount numeric(12,2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  cash_register_id uuid not null references public.cash_registers(id) on delete cascade,
  order_id uuid references public.orders(id),
  type text not null check (type in ('opening', 'sale', 'supply', 'withdrawal', 'closing', 'expense', 'receivable')),
  method text check (method in ('cash', 'pix', 'credit_card', 'debit_card', 'voucher', 'courtesy')),
  amount numeric(12,2) not null,
  note text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id),
  product_id uuid references public.products(id),
  order_id uuid references public.orders(id),
  purchase_id uuid references public.purchases(id),
  type text not null check (type in ('in', 'out', 'adjustment', 'loss', 'sale', 'production')),
  quantity numeric(12,4) not null check (quantity > 0),
  measure_unit text not null,
  reason text not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('revenue', 'expense')),
  dre_group text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, type)
);

create table if not exists public.cost_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revenues (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  category_id uuid references public.financial_categories(id),
  cost_center_id uuid references public.cost_centers(id),
  description text not null,
  amount numeric(12,2) not null,
  status text not null default 'open' check (status in ('open', 'paid', 'overdue', 'canceled')),
  competence_date date not null,
  due_date date not null,
  paid_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references public.purchases(id),
  category_id uuid references public.financial_categories(id),
  cost_center_id uuid references public.cost_centers(id),
  description text not null,
  amount numeric(12,2) not null,
  status text not null default 'open' check (status in ('open', 'paid', 'overdue', 'canceled')),
  competence_date date not null,
  due_date date not null,
  paid_at timestamptz,
  attachment_url text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.accounts_payable (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references public.expenses(id) on delete cascade,
  supplier_id uuid references public.suppliers(id),
  description text not null,
  amount numeric(12,2) not null,
  status text not null default 'open' check (status in ('open', 'paid', 'overdue', 'canceled')),
  competence_date date not null,
  due_date date not null,
  paid_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.accounts_receivable (
  id uuid primary key default gen_random_uuid(),
  revenue_id uuid references public.revenues(id) on delete cascade,
  customer_id uuid references public.customers(id),
  description text not null,
  amount numeric(12,2) not null,
  status text not null default 'open' check (status in ('open', 'paid', 'overdue', 'canceled')),
  competence_date date not null,
  due_date date not null,
  paid_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  name text not null,
  role text not null,
  hired_at date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.production_orders (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id),
  product_id uuid references public.products(id),
  quantity numeric(12,3) not null check (quantity > 0),
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done', 'canceled')),
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accountant_exports (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  format text not null check (format in ('csv', 'pdf', 'xlsx')),
  file_url text,
  generated_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  action text not null,
  details text,
  entity text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_role on public.users(role_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_inventory_items_min on public.inventory_items(quantity, min_quantity);
create index if not exists idx_inventory_movements_item_date on public.inventory_movements(inventory_item_id, created_at desc);
create index if not exists idx_orders_created_status on public.orders(created_at desc, status);
create index if not exists idx_order_items_product on public.order_items(product_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_cash_registers_status on public.cash_registers(status);
create index if not exists idx_cash_movements_cash on public.cash_movements(cash_register_id, created_at desc);
create index if not exists idx_revenues_due_status on public.revenues(due_date, status);
create index if not exists idx_expenses_due_status on public.expenses(due_date, status);
create index if not exists idx_accounts_payable_due_status on public.accounts_payable(due_date, status);
create index if not exists idx_accounts_receivable_due_status on public.accounts_receivable(due_date, status);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles','permissions','role_permissions','units','users','product_categories','products',
    'inventory_items','recipes','recipe_items','suppliers','purchases','purchase_items',
    'customers','cash_registers','orders','order_items','payments','cash_movements',
    'inventory_movements','financial_categories','cost_centers','revenues','expenses',
    'accounts_payable','accounts_receivable','employees','production_orders',
    'accountant_exports','audit_logs','settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

create policy "roles read" on public.roles for select using (auth.uid() is not null);
create policy "permissions read" on public.permissions for select using (auth.uid() is not null);
create policy "role permissions read" on public.role_permissions for select using (auth.uid() is not null);

create policy "users read own or manage" on public.users
  for select using (id = auth.uid() or public.has_permission('users:manage'));
create policy "users manage" on public.users
  for all using (public.has_permission('users:manage')) with check (public.has_permission('users:manage'));

create policy "settings manage" on public.settings
  for all using (public.has_permission('settings:manage')) with check (public.has_permission('settings:manage'));

create policy "units read" on public.units for select using (auth.uid() is not null);
create policy "units manage" on public.units
  for all using (public.has_permission('settings:manage')) with check (public.has_permission('settings:manage'));

create policy "catalog read" on public.product_categories
  for select using (auth.uid() is not null);
create policy "catalog manage categories" on public.product_categories
  for all using (public.has_permission('catalog:manage')) with check (public.has_permission('catalog:manage'));
create policy "products read" on public.products
  for select using (auth.uid() is not null);
create policy "products manage" on public.products
  for all using (public.has_permission('catalog:manage')) with check (public.has_permission('catalog:manage'));
create policy "recipes read" on public.recipes
  for select using (auth.uid() is not null);
create policy "recipes manage" on public.recipes
  for all using (public.has_permission('catalog:manage')) with check (public.has_permission('catalog:manage'));
create policy "recipe items read" on public.recipe_items
  for select using (auth.uid() is not null);
create policy "recipe items manage" on public.recipe_items
  for all using (public.has_permission('catalog:manage')) with check (public.has_permission('catalog:manage'));

create policy "inventory read" on public.inventory_items
  for select using (auth.uid() is not null);
create policy "inventory manage" on public.inventory_items
  for all using (public.has_permission('inventory:manage')) with check (public.has_permission('inventory:manage'));
create policy "inventory movements read" on public.inventory_movements
  for select using (auth.uid() is not null);
create policy "inventory movements manage" on public.inventory_movements
  for all using (public.has_permission('inventory:manage') or public.has_permission('pdv:operate'))
  with check (public.has_permission('inventory:manage') or public.has_permission('pdv:operate'));

create policy "purchases read" on public.suppliers for select using (auth.uid() is not null);
create policy "suppliers manage" on public.suppliers
  for all using (public.has_permission('purchases:manage')) with check (public.has_permission('purchases:manage'));
create policy "purchases select" on public.purchases for select using (auth.uid() is not null);
create policy "purchases manage" on public.purchases
  for all using (public.has_permission('purchases:manage')) with check (public.has_permission('purchases:manage'));
create policy "purchase items select" on public.purchase_items for select using (auth.uid() is not null);
create policy "purchase items manage" on public.purchase_items
  for all using (public.has_permission('purchases:manage')) with check (public.has_permission('purchases:manage'));

create policy "customers read" on public.customers for select using (auth.uid() is not null);
create policy "customers manage" on public.customers
  for all using (public.has_permission('pdv:operate') or public.has_permission('orders:manage'))
  with check (public.has_permission('pdv:operate') or public.has_permission('orders:manage'));

create policy "orders read" on public.orders for select using (auth.uid() is not null);
create policy "orders operate" on public.orders
  for all using (public.has_permission('pdv:operate') or public.has_permission('orders:manage') or public.has_permission('kitchen:manage'))
  with check (public.has_permission('pdv:operate') or public.has_permission('orders:manage'));
create policy "order items read" on public.order_items for select using (auth.uid() is not null);
create policy "order items operate" on public.order_items
  for all using (public.has_permission('pdv:operate') or public.has_permission('orders:manage'))
  with check (public.has_permission('pdv:operate') or public.has_permission('orders:manage'));
create policy "payments read" on public.payments for select using (auth.uid() is not null);
create policy "payments operate" on public.payments
  for all using (public.has_permission('pdv:operate') or public.has_permission('finance:manage'))
  with check (public.has_permission('pdv:operate') or public.has_permission('finance:manage'));

create policy "cash registers read" on public.cash_registers for select using (auth.uid() is not null);
create policy "cash registers operate" on public.cash_registers
  for all using (public.has_permission('pdv:operate') or public.has_permission('finance:manage'))
  with check (public.has_permission('pdv:operate') or public.has_permission('finance:manage'));
create policy "cash movements read" on public.cash_movements for select using (auth.uid() is not null);
create policy "cash movements operate" on public.cash_movements
  for all using (public.has_permission('pdv:operate') or public.has_permission('finance:manage'))
  with check (public.has_permission('pdv:operate') or public.has_permission('finance:manage'));

create policy "financial categories read" on public.financial_categories for select using (auth.uid() is not null);
create policy "financial categories manage" on public.financial_categories
  for all using (public.has_permission('finance:manage')) with check (public.has_permission('finance:manage'));
create policy "cost centers read" on public.cost_centers for select using (auth.uid() is not null);
create policy "cost centers manage" on public.cost_centers
  for all using (public.has_permission('finance:manage')) with check (public.has_permission('finance:manage'));
create policy "revenues read" on public.revenues for select using (public.has_permission('finance:manage') or public.has_permission('reports:view') or public.has_permission('accounting:view'));
create policy "revenues manage" on public.revenues
  for all using (public.has_permission('finance:manage') or public.has_permission('pdv:operate'))
  with check (public.has_permission('finance:manage') or public.has_permission('pdv:operate'));
create policy "expenses read" on public.expenses for select using (public.has_permission('finance:manage') or public.has_permission('reports:view') or public.has_permission('accounting:view'));
create policy "expenses manage" on public.expenses
  for all using (public.has_permission('finance:manage')) with check (public.has_permission('finance:manage'));
create policy "accounts payable read" on public.accounts_payable for select using (public.has_permission('finance:manage') or public.has_permission('accounting:view'));
create policy "accounts payable manage" on public.accounts_payable
  for all using (public.has_permission('finance:manage')) with check (public.has_permission('finance:manage'));
create policy "accounts receivable read" on public.accounts_receivable for select using (public.has_permission('finance:manage') or public.has_permission('accounting:view'));
create policy "accounts receivable manage" on public.accounts_receivable
  for all using (public.has_permission('finance:manage')) with check (public.has_permission('finance:manage'));

create policy "employees read" on public.employees for select using (auth.uid() is not null);
create policy "employees manage" on public.employees
  for all using (public.has_permission('users:manage')) with check (public.has_permission('users:manage'));

create policy "production read" on public.production_orders for select using (auth.uid() is not null);
create policy "production manage" on public.production_orders
  for all using (public.has_permission('kitchen:manage')) with check (public.has_permission('kitchen:manage'));

create policy "accountant exports read" on public.accountant_exports for select using (public.has_permission('accounting:view'));
create policy "accountant exports create" on public.accountant_exports
  for insert with check (public.has_permission('accounting:view'));

create policy "audit read" on public.audit_logs for select using (public.has_permission('audit:view'));
create policy "audit insert" on public.audit_logs for insert with check (auth.uid() is not null);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles','units','users','product_categories','products','inventory_items','recipes',
    'suppliers','purchases','customers','cash_registers','orders','financial_categories',
    'cost_centers','revenues','expenses','accounts_payable','accounts_receivable',
    'employees','production_orders','settings'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;
