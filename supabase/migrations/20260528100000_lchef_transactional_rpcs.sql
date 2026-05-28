alter table public.orders add column if not exists idempotency_key text;
alter table public.payments add column if not exists is_received boolean not null default true;
alter table public.payments add column if not exists due_date date;
alter table public.cash_registers add column if not exists closing_summary jsonb not null default '{}'::jsonb;
alter table public.cash_movements add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.inventory_movements add column if not exists origin text;
alter table public.inventory_movements add column if not exists reference_id uuid;
alter table public.inventory_movements add column if not exists unit_cost numeric(12,4);
alter table public.inventory_movements add column if not exists before_quantity numeric(12,4);
alter table public.inventory_movements add column if not exists after_quantity numeric(12,4);
alter table public.inventory_movements add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.audit_logs add column if not exists unit_id uuid references public.units(id);
alter table public.audit_logs add column if not exists old_data jsonb;
alter table public.audit_logs add column if not exists new_data jsonb;
alter table public.audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists idx_orders_user_idempotency
  on public.orders(created_by, idempotency_key)
  where idempotency_key is not null;

create index if not exists idx_orders_unit_created on public.orders(unit_id, created_at desc);
create index if not exists idx_cash_registers_unit_status on public.cash_registers(unit_id, status);
create index if not exists idx_inventory_movements_reference on public.inventory_movements(origin, reference_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_id() = 'admin';
$$;

create or replace function public.user_unit_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select unit_id from public.users where id = auth.uid() and active = true and deleted_at is null limit 1;
$$;

create or replace function public.same_unit(unit uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or unit is null or unit = public.user_unit_id();
$$;

create or replace function public.rpc_success(data jsonb default '{}'::jsonb)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object('success', true) || coalesce(data, '{}'::jsonb);
$$;

create or replace function public.rpc_error(code text, message text, details jsonb default '{}'::jsonb)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'success', false,
    'code', code,
    'message', message,
    'details', coalesce(details, '{}'::jsonb)
  );
$$;

create or replace function public.rpc_audit(
  p_unit_id uuid,
  p_action text,
  p_entity text,
  p_entity_id uuid,
  p_old_data jsonb default null,
  p_new_data jsonb default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (
    user_id,
    unit_id,
    action,
    entity,
    entity_id,
    details,
    old_data,
    new_data,
    metadata
  ) values (
    auth.uid(),
    p_unit_id,
    p_action,
    p_entity,
    p_entity_id,
    p_action,
    p_old_data,
    p_new_data,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function public.rpc_require_permission(permission text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return public.rpc_error('UNAUTHENTICATED', 'Usuario nao autenticado.');
  end if;

  if not public.has_permission(permission) then
    return public.rpc_error('FORBIDDEN', 'Usuario sem permissao para executar esta operacao.');
  end if;

  return public.rpc_success();
end;
$$;

create or replace function public.rpc_open_cash_register(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_unit_id uuid := (payload->>'unit_id')::uuid;
  v_amount numeric := coalesce((payload->>'opening_amount')::numeric, 0);
  v_existing_id uuid;
  v_cash_id uuid;
begin
  v_permission := public.rpc_require_permission('pdv:operate');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  if v_unit_id is null or not public.same_unit(v_unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Unidade invalida para o usuario.');
  end if;

  select id into v_existing_id
  from public.cash_registers
  where unit_id = v_unit_id and status = 'open'
  limit 1;

  if v_existing_id is not null then
    return public.rpc_error(
      'CASH_ALREADY_OPEN',
      'Ja existe um caixa aberto para esta unidade.',
      jsonb_build_object('cash_register_id', v_existing_id)
    );
  end if;

  insert into public.cash_registers (unit_id, opened_by, opening_amount, status)
  values (v_unit_id, auth.uid(), v_amount, 'open')
  returning id into v_cash_id;

  insert into public.cash_movements (
    cash_register_id,
    type,
    method,
    amount,
    note,
    created_by
  ) values (
    v_cash_id,
    'opening',
    'cash',
    v_amount,
    'Abertura de caixa',
    auth.uid()
  );

  perform public.rpc_audit(
    v_unit_id,
    'cash_register.opened',
    'cash_registers',
    v_cash_id,
    null,
    jsonb_build_object('opening_amount', v_amount)
  );

  return public.rpc_success(jsonb_build_object(
    'cash_register_id', v_cash_id,
    'opening_amount', v_amount,
    'message', 'Caixa aberto com sucesso.'
  ));
exception when others then
  return public.rpc_error('OPEN_CASH_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_register_cash_movement(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_unit_id uuid := (payload->>'unit_id')::uuid;
  v_type text := payload->>'type';
  v_amount numeric := coalesce((payload->>'amount')::numeric, 0);
  v_note text := coalesce(payload->>'note', '');
  v_cash_id uuid;
  v_movement_id uuid;
begin
  v_permission := public.rpc_require_permission('pdv:operate');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  if v_unit_id is null or not public.same_unit(v_unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Unidade invalida para o usuario.');
  end if;

  if v_type not in ('supply', 'withdrawal') then
    return public.rpc_error('INVALID_MOVEMENT_TYPE', 'Use supply ou withdrawal para movimentacao manual de caixa.');
  end if;

  if v_amount <= 0 then
    return public.rpc_error('INVALID_AMOUNT', 'O valor da movimentacao deve ser maior que zero.');
  end if;

  select id into v_cash_id
  from public.cash_registers
  where unit_id = v_unit_id and status = 'open'
  order by opened_at desc
  limit 1
  for update;

  if v_cash_id is null then
    return public.rpc_error('NO_OPEN_CASH_REGISTER', 'Abra o caixa antes de registrar movimentacoes.');
  end if;

  insert into public.cash_movements (
    cash_register_id,
    type,
    method,
    amount,
    note,
    created_by,
    metadata
  ) values (
    v_cash_id,
    v_type,
    'cash',
    v_amount,
    v_note,
    auth.uid(),
    coalesce(payload->'metadata', '{}'::jsonb)
  )
  returning id into v_movement_id;

  perform public.rpc_audit(
    v_unit_id,
    case when v_type = 'supply' then 'cash_movement.supply' else 'cash_movement.withdrawal' end,
    'cash_movements',
    v_movement_id,
    null,
    jsonb_build_object('type', v_type, 'amount', v_amount, 'note', v_note)
  );

  return public.rpc_success(jsonb_build_object(
    'cash_register_id', v_cash_id,
    'cash_movement_id', v_movement_id,
    'message', 'Movimentacao de caixa registrada.'
  ));
exception when others then
  return public.rpc_error('CASH_MOVEMENT_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_close_cash_register(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_unit_id uuid := (payload->>'unit_id')::uuid;
  v_cash_id uuid := nullif(payload->>'cash_register_id', '')::uuid;
  v_informed numeric := coalesce((payload->>'informed_amount')::numeric, 0);
  v_summary jsonb;
  v_expected numeric;
  v_difference numeric;
begin
  v_permission := public.rpc_require_permission('pdv:operate');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  if v_unit_id is null or not public.same_unit(v_unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Unidade invalida para o usuario.');
  end if;

  if v_cash_id is null then
    select id into v_cash_id
    from public.cash_registers
    where unit_id = v_unit_id and status = 'open'
    order by opened_at desc
    limit 1;
  end if;

  if v_cash_id is null then
    return public.rpc_error('NO_OPEN_CASH_REGISTER', 'Nao ha caixa aberto para fechamento.');
  end if;

  perform 1
  from public.cash_registers
  where id = v_cash_id and unit_id = v_unit_id and status = 'open'
  for update;

  if not found then
    return public.rpc_error('INVALID_CASH_REGISTER', 'Caixa nao encontrado ou ja fechado.');
  end if;

  select jsonb_build_object(
    'opening_amount', coalesce(sum(amount) filter (where type = 'opening'), 0),
    'cash_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'cash'), 0),
    'pix_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'pix'), 0),
    'credit_card_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'credit_card'), 0),
    'debit_card_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'debit_card'), 0),
    'voucher_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'voucher'), 0),
    'supplies', coalesce(sum(amount) filter (where type = 'supply'), 0),
    'withdrawals', coalesce(sum(amount) filter (where type = 'withdrawal'), 0),
    'expenses', coalesce(sum(amount) filter (where type = 'expense'), 0),
    'receivables', coalesce(sum(amount) filter (where type = 'receivable'), 0)
  )
  into v_summary
  from public.cash_movements
  where cash_register_id = v_cash_id;

  v_expected :=
    coalesce((v_summary->>'opening_amount')::numeric, 0)
    + coalesce((v_summary->>'cash_sales')::numeric, 0)
    + coalesce((v_summary->>'supplies')::numeric, 0)
    + coalesce((v_summary->>'receivables')::numeric, 0)
    - coalesce((v_summary->>'withdrawals')::numeric, 0)
    - coalesce((v_summary->>'expenses')::numeric, 0);

  v_difference := v_informed - v_expected;

  update public.cash_registers
  set
    status = 'closed',
    closed_by = auth.uid(),
    closed_at = now(),
    informed_amount = v_informed,
    expected_amount = v_expected,
    difference = v_difference,
    closing_summary = v_summary
  where id = v_cash_id;

  insert into public.cash_movements (
    cash_register_id,
    type,
    method,
    amount,
    note,
    created_by
  ) values (
    v_cash_id,
    'closing',
    'cash',
    v_informed,
    'Fechamento de caixa',
    auth.uid()
  );

  perform public.rpc_audit(
    v_unit_id,
    'cash_register.closed',
    'cash_registers',
    v_cash_id,
    null,
    jsonb_build_object(
      'expected_amount', v_expected,
      'informed_amount', v_informed,
      'difference', v_difference,
      'summary', v_summary
    )
  );

  return public.rpc_success(jsonb_build_object(
    'cash_register_id', v_cash_id,
    'expected_amount', v_expected,
    'informed_amount', v_informed,
    'difference', v_difference,
    'summary', v_summary,
    'message', 'Caixa fechado com sucesso.'
  ));
exception when others then
  return public.rpc_error('CLOSE_CASH_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_complete_sale(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_unit_id uuid := (payload->>'unit_id')::uuid;
  v_customer_id uuid := nullif(payload->>'customer_id', '')::uuid;
  v_customer_name text := nullif(payload->>'customer_name', '');
  v_channel text := coalesce(nullif(payload->>'channel', ''), 'balcao');
  v_discount numeric := coalesce((payload->>'discount')::numeric, 0);
  v_service_fee numeric := coalesce((payload->>'service_fee')::numeric, 0);
  v_key text := nullif(payload->>'client_request_id', '');
  v_require_cash boolean := true;
  v_allow_negative boolean := false;
  v_cash_id uuid;
  v_existing_order public.orders%rowtype;
  v_order_id uuid;
  v_item jsonb;
  v_payment jsonb;
  v_product public.products%rowtype;
  v_recipe_id uuid;
  v_recipe_yield numeric;
  v_item_qty numeric;
  v_item_price numeric;
  v_subtotal numeric := 0;
  v_total numeric := 0;
  v_payment_total numeric := 0;
  v_inventory_count integer := 0;
  v_financial_count integer := 0;
  v_payment_count integer := 0;
  v_revenue_id uuid;
  v_category_id uuid;
  v_cost_center_id uuid;
  v_before numeric;
  v_after numeric;
  v_required numeric;
  v_ingredient record;
begin
  v_permission := public.rpc_require_permission('pdv:operate');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  if v_unit_id is null or not public.same_unit(v_unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Unidade invalida para o usuario.');
  end if;

  if v_key is null then
    return public.rpc_error('MISSING_IDEMPOTENCY_KEY', 'Informe client_request_id para evitar vendas duplicadas.');
  end if;

  select * into v_existing_order
  from public.orders
  where created_by = auth.uid() and idempotency_key = v_key
  limit 1;

  if found then
    return public.rpc_success(jsonb_build_object(
      'order_id', v_existing_order.id,
      'cash_register_id', v_existing_order.cash_register_id,
      'total', v_existing_order.total,
      'idempotent', true,
      'message', 'Venda ja processada anteriormente.'
    ));
  end if;

  select coalesce((value->>'require_open_cash')::boolean, true),
         coalesce((value->>'allow_negative_stock')::boolean, false)
  into v_require_cash, v_allow_negative
  from public.settings
  where key = 'pdv';

  if v_require_cash then
    select id into v_cash_id
    from public.cash_registers
    where unit_id = v_unit_id and status = 'open'
    order by opened_at desc
    limit 1
    for update;

    if v_cash_id is null then
      return public.rpc_error('NO_OPEN_CASH_REGISTER', 'Abra o caixa antes de finalizar a venda.');
    end if;
  end if;

  if coalesce(jsonb_array_length(payload->'items'), 0) = 0 then
    return public.rpc_error('EMPTY_SALE', 'Adicione ao menos um item a venda.');
  end if;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_item_qty := coalesce((v_item->>'quantity')::numeric, 0);
    if v_item_qty <= 0 then
      return public.rpc_error('INVALID_QUANTITY', 'Quantidade deve ser maior que zero.');
    end if;

    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
      and unit_id = v_unit_id
      and active = true
      and deleted_at is null
    for update;

    if not found then
      return public.rpc_error('PRODUCT_NOT_FOUND', 'Produto inexistente ou inativo.', v_item);
    end if;

    v_item_price := coalesce((v_item->>'unit_price')::numeric, v_product.price);
    if v_item_price <= 0 then
      return public.rpc_error('INVALID_PRICE', 'Produto com preco invalido.', jsonb_build_object('product_id', v_product.id));
    end if;

    v_subtotal := v_subtotal + (v_item_price * v_item_qty);
  end loop;

  v_total := round(v_subtotal - v_discount + v_service_fee, 2);
  if v_total < 0 then
    return public.rpc_error('INVALID_TOTAL', 'Total da venda nao pode ser negativo.');
  end if;

  for v_payment in select * from jsonb_array_elements(payload->'payments')
  loop
    v_payment_total := v_payment_total + coalesce((v_payment->>'amount')::numeric, 0);
  end loop;

  if abs(v_payment_total - v_total) > 0.01 then
    return public.rpc_error(
      'PAYMENT_MISMATCH',
      'Pagamentos nao fecham com o total da venda.',
      jsonb_build_object('total', v_total, 'payments_total', v_payment_total)
    );
  end if;

  insert into public.orders (
    unit_id,
    customer_id,
    customer_name,
    channel,
    status,
    subtotal,
    discount,
    service_fee,
    total,
    cash_register_id,
    idempotency_key,
    created_by
  ) values (
    v_unit_id,
    v_customer_id,
    coalesce(v_customer_name, 'Balcao'),
    v_channel,
    'new',
    v_subtotal,
    v_discount,
    v_service_fee,
    v_total,
    v_cash_id,
    v_key,
    auth.uid()
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_item_qty := (v_item->>'quantity')::numeric;

    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
    for update;

    v_item_price := coalesce((v_item->>'unit_price')::numeric, v_product.price);

    insert into public.order_items (
      order_id,
      product_id,
      name,
      quantity,
      unit_price,
      unit_cost
    ) values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_item_qty,
      v_item_price,
      v_product.cost
    );

    if v_product.stock < 900 then
      if not v_allow_negative and v_product.stock - v_item_qty < 0 then
        raise exception 'Estoque insuficiente para %.', v_product.name using errcode = 'P0001';
      end if;

      update public.products
      set stock = stock - v_item_qty
      where id = v_product.id;
    end if;

    select r.id, r.yield_qty into v_recipe_id, v_recipe_yield
    from public.recipes r
    where r.product_id = v_product.id
      and r.active = true
      and r.deleted_at is null
    order by r.created_at desc
    limit 1;

    if v_recipe_id is null and v_product.type = 'finished' then
      raise exception 'Ficha tecnica ativa ausente para %.', v_product.name using errcode = 'P0001';
    end if;

    for v_ingredient in
      select
        ri.inventory_item_id,
        ri.quantity,
        ri.measure_unit,
        ii.name,
        ii.quantity as stock_quantity,
        ii.unit_cost
      from public.recipe_items ri
      join public.inventory_items ii on ii.id = ri.inventory_item_id
      where ri.recipe_id = v_recipe_id
      for update of ii
    loop
      v_required := round((v_ingredient.quantity / greatest(v_recipe_yield, 1)) * v_item_qty, 4);
      v_before := v_ingredient.stock_quantity;
      v_after := v_before - v_required;

      if not v_allow_negative and v_after < 0 then
        raise exception 'Estoque insuficiente para %.', v_ingredient.name using errcode = 'P0001';
      end if;

      update public.inventory_items
      set quantity = v_after
      where id = v_ingredient.inventory_item_id;

      insert into public.inventory_movements (
        inventory_item_id,
        product_id,
        order_id,
        type,
        quantity,
        measure_unit,
        reason,
        created_by,
        origin,
        reference_id,
        unit_cost,
        before_quantity,
        after_quantity,
        metadata
      ) values (
        v_ingredient.inventory_item_id,
        v_product.id,
        v_order_id,
        'sale',
        v_required,
        v_ingredient.measure_unit,
        'Baixa por venda',
        auth.uid(),
        'order',
        v_order_id,
        v_ingredient.unit_cost,
        v_before,
        v_after,
        jsonb_build_object('product_name', v_product.name)
      );

      v_inventory_count := v_inventory_count + 1;
    end loop;
  end loop;

  select id into v_category_id from public.financial_categories where name = 'Vendas' and type = 'revenue' limit 1;
  select id into v_cost_center_id from public.cost_centers where name = 'Loja' limit 1;

  for v_payment in select * from jsonb_array_elements(payload->'payments')
  loop
    insert into public.payments (
      order_id,
      method,
      amount,
      is_received,
      due_date
    ) values (
      v_order_id,
      v_payment->>'method',
      (v_payment->>'amount')::numeric,
      coalesce((v_payment->>'received')::boolean, true),
      coalesce((v_payment->>'due_date')::date, current_date)
    );
    v_payment_count := v_payment_count + 1;

    if coalesce((v_payment->>'received')::boolean, true) and v_payment->>'method' <> 'courtesy' then
      insert into public.revenues (
        order_id,
        category_id,
        cost_center_id,
        description,
        amount,
        status,
        competence_date,
        due_date,
        paid_at,
        created_by
      ) values (
        v_order_id,
        v_category_id,
        v_cost_center_id,
        'Venda ' || v_order_id::text,
        (v_payment->>'amount')::numeric,
        'paid',
        current_date,
        current_date,
        now(),
        auth.uid()
      );
      v_financial_count := v_financial_count + 1;

      if v_cash_id is not null then
        insert into public.cash_movements (
          cash_register_id,
          order_id,
          type,
          method,
          amount,
          note,
          created_by
        ) values (
          v_cash_id,
          v_order_id,
          'sale',
          v_payment->>'method',
          (v_payment->>'amount')::numeric,
          'Venda ' || v_order_id::text,
          auth.uid()
        );
      end if;
    elsif not coalesce((v_payment->>'received')::boolean, true) then
      insert into public.revenues (
        order_id,
        category_id,
        cost_center_id,
        description,
        amount,
        status,
        competence_date,
        due_date,
        created_by
      ) values (
        v_order_id,
        v_category_id,
        v_cost_center_id,
        'Venda a receber ' || v_order_id::text,
        (v_payment->>'amount')::numeric,
        'open',
        current_date,
        coalesce((v_payment->>'due_date')::date, current_date),
        auth.uid()
      )
      returning id into v_revenue_id;

      insert into public.accounts_receivable (
        revenue_id,
        customer_id,
        description,
        amount,
        status,
        competence_date,
        due_date,
        created_by
      ) values (
        v_revenue_id,
        v_customer_id,
        'Venda a receber ' || v_order_id::text,
        (v_payment->>'amount')::numeric,
        'open',
        current_date,
        coalesce((v_payment->>'due_date')::date, current_date),
        auth.uid()
      );
      v_financial_count := v_financial_count + 2;
    end if;
  end loop;

  perform public.rpc_audit(
    v_unit_id,
    'order.completed',
    'orders',
    v_order_id,
    null,
    jsonb_build_object(
      'subtotal', v_subtotal,
      'discount', v_discount,
      'service_fee', v_service_fee,
      'total', v_total,
      'payments_count', v_payment_count,
      'inventory_movements_count', v_inventory_count,
      'financial_entries_count', v_financial_count
    ),
    jsonb_build_object('client_request_id', v_key)
  );

  return public.rpc_success(jsonb_build_object(
    'order_id', v_order_id,
    'cash_register_id', v_cash_id,
    'total', v_total,
    'inventory_movements_count', v_inventory_count,
    'financial_entries_count', v_financial_count,
    'payments_count', v_payment_count,
    'message', 'Venda finalizada com sucesso.'
  ));
exception
  when unique_violation then
    select * into v_existing_order
    from public.orders
    where created_by = auth.uid() and idempotency_key = v_key
    limit 1;

    return public.rpc_success(jsonb_build_object(
      'order_id', v_existing_order.id,
      'cash_register_id', v_existing_order.cash_register_id,
      'total', v_existing_order.total,
      'idempotent', true,
      'message', 'Venda ja processada anteriormente.'
    ));
  when others then
    if sqlerrm ilike 'Estoque insuficiente%' then
      return public.rpc_error('INSUFFICIENT_STOCK', sqlerrm);
    elsif sqlerrm ilike 'Ficha tecnica%' then
      return public.rpc_error('MISSING_RECIPE', sqlerrm);
    end if;
    return public.rpc_error('COMPLETE_SALE_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_cancel_sale(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_order public.orders%rowtype;
  v_reason text := coalesce(payload->>'reason', 'Cancelamento sem motivo informado');
  v_movement record;
  v_before numeric;
  v_after numeric;
  v_restored integer := 0;
begin
  v_permission := public.rpc_require_permission('orders:manage');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  select * into v_order
  from public.orders
  where id = (payload->>'order_id')::uuid
  for update;

  if not found then
    return public.rpc_error('ORDER_NOT_FOUND', 'Pedido nao encontrado.');
  end if;

  if not public.same_unit(v_order.unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Pedido pertence a outra unidade.');
  end if;

  if v_order.status = 'canceled' then
    return public.rpc_success(jsonb_build_object('order_id', v_order.id, 'message', 'Pedido ja estava cancelado.'));
  end if;

  for v_movement in
    select *
    from public.inventory_movements
    where order_id = v_order.id and type = 'sale'
    for update
  loop
    select quantity into v_before
    from public.inventory_items
    where id = v_movement.inventory_item_id
    for update;

    v_after := v_before + v_movement.quantity;

    update public.inventory_items
    set quantity = v_after
    where id = v_movement.inventory_item_id;

    insert into public.inventory_movements (
      inventory_item_id,
      product_id,
      order_id,
      type,
      quantity,
      measure_unit,
      reason,
      created_by,
      origin,
      reference_id,
      unit_cost,
      before_quantity,
      after_quantity,
      metadata
    ) values (
      v_movement.inventory_item_id,
      v_movement.product_id,
      v_order.id,
      'adjustment',
      v_movement.quantity,
      v_movement.measure_unit,
      'Estorno por cancelamento de venda',
      auth.uid(),
      'order_cancelation',
      v_order.id,
      v_movement.unit_cost,
      v_before,
      v_after,
      jsonb_build_object('reason', v_reason)
    );

    v_restored := v_restored + 1;
  end loop;

  update public.orders
  set status = 'canceled',
      canceled_at = now(),
      cancel_reason = v_reason
  where id = v_order.id;

  update public.revenues
  set status = 'canceled'
  where order_id = v_order.id;

  update public.accounts_receivable ar
  set status = 'canceled'
  from public.revenues r
  where ar.revenue_id = r.id and r.order_id = v_order.id;

  insert into public.cash_movements (
    cash_register_id,
    order_id,
    type,
    method,
    amount,
    note,
    created_by
  )
  select
    v_order.cash_register_id,
    v_order.id,
    'withdrawal',
    p.method,
    p.amount,
    'Estorno da venda ' || v_order.id::text,
    auth.uid()
  from public.payments p
  where p.order_id = v_order.id
    and p.is_received = true
    and p.method = 'cash'
    and v_order.cash_register_id is not null;

  perform public.rpc_audit(
    v_order.unit_id,
    'order.canceled',
    'orders',
    v_order.id,
    to_jsonb(v_order),
    jsonb_build_object('status', 'canceled', 'reason', v_reason, 'restored_movements', v_restored)
  );

  return public.rpc_success(jsonb_build_object(
    'order_id', v_order.id,
    'inventory_movements_count', v_restored,
    'message', 'Venda cancelada e estornada com sucesso.'
  ));
exception when others then
  return public.rpc_error('CANCEL_SALE_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_receive_account(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_account public.accounts_receivable%rowtype;
  v_cash_id uuid := nullif(payload->>'cash_register_id', '')::uuid;
  v_unit_id uuid := (payload->>'unit_id')::uuid;
  v_method text := coalesce(payload->>'method', 'cash');
begin
  v_permission := public.rpc_require_permission('finance:manage');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  if v_unit_id is null or not public.same_unit(v_unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Unidade invalida para o usuario.');
  end if;

  select * into v_account
  from public.accounts_receivable
  where id = (payload->>'account_receivable_id')::uuid
  for update;

  if not found then
    return public.rpc_error('ACCOUNT_NOT_FOUND', 'Conta a receber nao encontrada.');
  end if;

  update public.accounts_receivable
  set status = 'paid',
      paid_at = now()
  where id = v_account.id;

  update public.revenues
  set status = 'paid',
      paid_at = now()
  where id = v_account.revenue_id;

  if v_cash_id is not null then
    insert into public.cash_movements (
      cash_register_id,
      type,
      method,
      amount,
      note,
      created_by
    ) values (
      v_cash_id,
      'receivable',
      v_method,
      v_account.amount,
      v_account.description,
      auth.uid()
    );
  end if;

  perform public.rpc_audit(
    v_unit_id,
    'account.received',
    'accounts_receivable',
    v_account.id,
    to_jsonb(v_account),
    jsonb_build_object('status', 'paid', 'method', v_method)
  );

  return public.rpc_success(jsonb_build_object(
    'account_receivable_id', v_account.id,
    'amount', v_account.amount,
    'message', 'Conta recebida com sucesso.'
  ));
exception when others then
  return public.rpc_error('RECEIVE_ACCOUNT_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_pay_account(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_account public.accounts_payable%rowtype;
  v_cash_id uuid := nullif(payload->>'cash_register_id', '')::uuid;
  v_unit_id uuid := (payload->>'unit_id')::uuid;
  v_method text := coalesce(payload->>'method', 'cash');
begin
  v_permission := public.rpc_require_permission('finance:manage');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  if v_unit_id is null or not public.same_unit(v_unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Unidade invalida para o usuario.');
  end if;

  select * into v_account
  from public.accounts_payable
  where id = (payload->>'account_payable_id')::uuid
  for update;

  if not found then
    return public.rpc_error('ACCOUNT_NOT_FOUND', 'Conta a pagar nao encontrada.');
  end if;

  update public.accounts_payable
  set status = 'paid',
      paid_at = now()
  where id = v_account.id;

  update public.expenses
  set status = 'paid',
      paid_at = now()
  where id = v_account.expense_id;

  if v_cash_id is not null then
    insert into public.cash_movements (
      cash_register_id,
      type,
      method,
      amount,
      note,
      created_by
    ) values (
      v_cash_id,
      'expense',
      v_method,
      v_account.amount,
      v_account.description,
      auth.uid()
    );
  end if;

  perform public.rpc_audit(
    v_unit_id,
    'account.paid',
    'accounts_payable',
    v_account.id,
    to_jsonb(v_account),
    jsonb_build_object('status', 'paid', 'method', v_method)
  );

  return public.rpc_success(jsonb_build_object(
    'account_payable_id', v_account.id,
    'amount', v_account.amount,
    'message', 'Conta paga com sucesso.'
  ));
exception when others then
  return public.rpc_error('PAY_ACCOUNT_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_receive_purchase(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_purchase public.purchases%rowtype;
  v_item record;
  v_before numeric;
  v_after numeric;
  v_expense_id uuid;
  v_category_id uuid;
  v_cost_center_id uuid;
  v_count integer := 0;
begin
  v_permission := public.rpc_require_permission('purchases:manage');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  select * into v_purchase
  from public.purchases
  where id = (payload->>'purchase_id')::uuid
  for update;

  if not found then
    return public.rpc_error('PURCHASE_NOT_FOUND', 'Compra nao encontrada.');
  end if;

  if not public.same_unit(v_purchase.unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Compra pertence a outra unidade.');
  end if;

  if v_purchase.status in ('received', 'paid') then
    return public.rpc_success(jsonb_build_object('purchase_id', v_purchase.id, 'message', 'Compra ja recebida.'));
  end if;

  for v_item in
    select pi.*, ii.quantity as current_quantity
    from public.purchase_items pi
    join public.inventory_items ii on ii.id = pi.inventory_item_id
    where pi.purchase_id = v_purchase.id
    for update of ii
  loop
    v_before := v_item.current_quantity;
    v_after := v_before + v_item.quantity;

    update public.inventory_items
    set quantity = v_after,
        unit_cost = v_item.unit_cost
    where id = v_item.inventory_item_id;

    insert into public.inventory_movements (
      inventory_item_id,
      purchase_id,
      type,
      quantity,
      measure_unit,
      reason,
      created_by,
      origin,
      reference_id,
      unit_cost,
      before_quantity,
      after_quantity
    ) values (
      v_item.inventory_item_id,
      v_purchase.id,
      'in',
      v_item.quantity,
      v_item.measure_unit,
      'Recebimento de compra',
      auth.uid(),
      'purchase',
      v_purchase.id,
      v_item.unit_cost,
      v_before,
      v_after
    );
    v_count := v_count + 1;
  end loop;

  update public.purchases
  set status = 'received',
      received_at = now()
  where id = v_purchase.id;

  select id into v_category_id from public.financial_categories where name = 'Compras' and type = 'expense' limit 1;
  select id into v_cost_center_id from public.cost_centers where name = 'Estoque' limit 1;

  insert into public.expenses (
    purchase_id,
    category_id,
    cost_center_id,
    description,
    amount,
    status,
    competence_date,
    due_date,
    created_by
  ) values (
    v_purchase.id,
    v_category_id,
    v_cost_center_id,
    'Compra ' || coalesce(v_purchase.invoice_number, v_purchase.id::text),
    v_purchase.total,
    'open',
    current_date,
    current_date,
    auth.uid()
  )
  returning id into v_expense_id;

  insert into public.accounts_payable (
    expense_id,
    supplier_id,
    description,
    amount,
    status,
    competence_date,
    due_date,
    created_by
  ) values (
    v_expense_id,
    v_purchase.supplier_id,
    'Compra ' || coalesce(v_purchase.invoice_number, v_purchase.id::text),
    v_purchase.total,
    'open',
    current_date,
    current_date,
    auth.uid()
  );

  perform public.rpc_audit(
    v_purchase.unit_id,
    'purchase.received',
    'purchases',
    v_purchase.id,
    to_jsonb(v_purchase),
    jsonb_build_object('status', 'received', 'inventory_movements_count', v_count)
  );

  return public.rpc_success(jsonb_build_object(
    'purchase_id', v_purchase.id,
    'inventory_movements_count', v_count,
    'financial_entries_count', 2,
    'message', 'Compra recebida com sucesso.'
  ));
exception when others then
  return public.rpc_error('RECEIVE_PURCHASE_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_adjust_inventory(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission jsonb;
  v_item public.inventory_items%rowtype;
  v_target_quantity numeric;
  v_delta numeric;
  v_after numeric;
  v_movement_id uuid;
begin
  v_permission := public.rpc_require_permission('inventory:manage');
  if not (v_permission->>'success')::boolean then
    return v_permission;
  end if;

  select * into v_item
  from public.inventory_items
  where id = (payload->>'inventory_item_id')::uuid
  for update;

  if not found then
    return public.rpc_error('INVENTORY_ITEM_NOT_FOUND', 'Item de estoque nao encontrado.');
  end if;

  if not public.same_unit(v_item.unit_id) then
    return public.rpc_error('INVALID_UNIT', 'Insumo pertence a outra unidade.');
  end if;

  v_target_quantity := nullif(payload->>'target_quantity', '')::numeric;
  v_delta := nullif(payload->>'quantity_delta', '')::numeric;

  if v_target_quantity is null and v_delta is null then
    return public.rpc_error('INVALID_QUANTITY', 'Informe target_quantity ou quantity_delta.');
  end if;

  v_after := coalesce(v_target_quantity, v_item.quantity + v_delta);

  if v_after < 0 then
    return public.rpc_error('INSUFFICIENT_STOCK', 'Ajuste deixaria estoque negativo.');
  end if;

  update public.inventory_items
  set quantity = v_after,
      unit_cost = coalesce(nullif(payload->>'unit_cost', '')::numeric, unit_cost)
  where id = v_item.id;

  insert into public.inventory_movements (
    inventory_item_id,
    type,
    quantity,
    measure_unit,
    reason,
    created_by,
    origin,
    reference_id,
    unit_cost,
    before_quantity,
    after_quantity,
    metadata
  ) values (
    v_item.id,
    coalesce(payload->>'type', 'adjustment'),
    abs(v_after - v_item.quantity),
    v_item.measure_unit,
    coalesce(payload->>'reason', 'Ajuste manual de estoque'),
    auth.uid(),
    coalesce(payload->>'origin', 'manual_adjustment'),
    nullif(payload->>'reference_id', '')::uuid,
    coalesce(nullif(payload->>'unit_cost', '')::numeric, v_item.unit_cost),
    v_item.quantity,
    v_after,
    coalesce(payload->'metadata', '{}'::jsonb)
  )
  returning id into v_movement_id;

  perform public.rpc_audit(
    v_item.unit_id,
    'inventory.adjusted',
    'inventory_items',
    v_item.id,
    to_jsonb(v_item),
    jsonb_build_object('quantity', v_after, 'movement_id', v_movement_id)
  );

  return public.rpc_success(jsonb_build_object(
    'inventory_item_id', v_item.id,
    'inventory_movement_id', v_movement_id,
    'before_quantity', v_item.quantity,
    'after_quantity', v_after,
    'message', 'Estoque ajustado com sucesso.'
  ));
exception when others then
  return public.rpc_error('ADJUST_INVENTORY_FAILED', sqlerrm);
end;
$$;

create or replace function public.rpc_create_inventory_movement(payload jsonb)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.rpc_adjust_inventory(payload);
$$;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.cash_registers enable row level security;
alter table public.cash_movements enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.products enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_items enable row level security;
alter table public.revenues enable row level security;
alter table public.expenses enable row level security;
alter table public.accounts_payable enable row level security;
alter table public.accounts_receivable enable row level security;
alter table public.audit_logs enable row level security;
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.units enable row level security;

drop policy if exists "orders read" on public.orders;
drop policy if exists "orders operate" on public.orders;
create policy "orders read by role and unit" on public.orders
  for select using (
    public.is_admin()
    or (public.same_unit(unit_id) and (
      public.has_permission('orders:manage')
      or public.has_permission('pdv:operate')
      or public.has_permission('kitchen:manage')
      or public.has_permission('reports:view')
      or public.has_permission('accounting:view')
    ))
  );
create policy "orders write through role and unit" on public.orders
  for all using (
    public.is_admin()
    or (public.same_unit(unit_id) and (public.has_permission('orders:manage') or public.has_permission('pdv:operate')))
  ) with check (
    public.is_admin()
    or (public.same_unit(unit_id) and (public.has_permission('orders:manage') or public.has_permission('pdv:operate')))
  );

drop policy if exists "inventory read" on public.inventory_items;
drop policy if exists "inventory manage" on public.inventory_items;
create policy "inventory read by role and unit" on public.inventory_items
  for select using (
    public.is_admin()
    or (public.same_unit(unit_id) and (
      public.has_permission('inventory:manage')
      or public.has_permission('catalog:manage')
      or public.has_permission('pdv:operate')
      or public.has_permission('reports:view')
    ))
  );
create policy "inventory manage by role and unit" on public.inventory_items
  for all using (
    public.is_admin() or (public.same_unit(unit_id) and public.has_permission('inventory:manage'))
  ) with check (
    public.is_admin() or (public.same_unit(unit_id) and public.has_permission('inventory:manage'))
  );

drop policy if exists "revenues read" on public.revenues;
drop policy if exists "expenses read" on public.expenses;
create policy "revenues read finance reports accounting" on public.revenues
  for select using (
    public.has_permission('finance:manage')
    or public.has_permission('reports:view')
    or public.has_permission('accounting:view')
  );
create policy "expenses read finance reports accounting" on public.expenses
  for select using (
    public.has_permission('finance:manage')
    or public.has_permission('reports:view')
    or public.has_permission('accounting:view')
  );

grant execute on function public.rpc_open_cash_register(jsonb) to authenticated;
grant execute on function public.rpc_close_cash_register(jsonb) to authenticated;
grant execute on function public.rpc_complete_sale(jsonb) to authenticated;
grant execute on function public.rpc_cancel_sale(jsonb) to authenticated;
grant execute on function public.rpc_register_cash_movement(jsonb) to authenticated;
grant execute on function public.rpc_receive_account(jsonb) to authenticated;
grant execute on function public.rpc_pay_account(jsonb) to authenticated;
grant execute on function public.rpc_receive_purchase(jsonb) to authenticated;
grant execute on function public.rpc_adjust_inventory(jsonb) to authenticated;
grant execute on function public.rpc_create_inventory_movement(jsonb) to authenticated;
