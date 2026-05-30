alter table public.cash_registers add column if not exists closing_summary jsonb not null default '{}'::jsonb;
alter table public.cash_movements add column if not exists metadata jsonb not null default '{}'::jsonb;

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
  v_closing_note text := coalesce(nullif(payload->>'closing_note', ''), 'Fechamento de caixa');
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

  if v_informed < 0 then
    return public.rpc_error('INVALID_CLOSING_AMOUNT', 'Valor informado no fechamento nao pode ser negativo.');
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
    'cash_sales', coalesce(sum(amount) filter (where type = 'sale' and coalesce(method, 'cash') = 'cash'), 0),
    'pix_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'pix'), 0),
    'credit_card_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'credit_card'), 0),
    'debit_card_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'debit_card'), 0),
    'voucher_sales', coalesce(sum(amount) filter (where type = 'sale' and method = 'voucher'), 0),
    'supplies', coalesce(sum(amount) filter (where type = 'supply'), 0),
    'withdrawals', coalesce(sum(amount) filter (where type = 'withdrawal'), 0),
    'cash_expenses', coalesce(sum(amount) filter (where type = 'expense' and coalesce(method, 'cash') = 'cash'), 0),
    'non_cash_expenses', coalesce(sum(amount) filter (where type = 'expense' and coalesce(method, 'cash') <> 'cash'), 0),
    'cash_receivables', coalesce(sum(amount) filter (where type = 'receivable' and coalesce(method, 'cash') = 'cash'), 0),
    'non_cash_receivables', coalesce(sum(amount) filter (where type = 'receivable' and coalesce(method, 'cash') <> 'cash'), 0),
    'total_sales', coalesce(sum(amount) filter (where type = 'sale'), 0),
    'total_non_cash_sales', coalesce(sum(amount) filter (where type = 'sale' and coalesce(method, 'cash') <> 'cash'), 0),
    'movement_count', count(*)
  )
  into v_summary
  from public.cash_movements
  where cash_register_id = v_cash_id
    and type <> 'closing';

  v_expected :=
    coalesce((v_summary->>'opening_amount')::numeric, 0)
    + coalesce((v_summary->>'cash_sales')::numeric, 0)
    + coalesce((v_summary->>'cash_receivables')::numeric, 0)
    + coalesce((v_summary->>'supplies')::numeric, 0)
    - coalesce((v_summary->>'withdrawals')::numeric, 0)
    - coalesce((v_summary->>'cash_expenses')::numeric, 0);

  v_difference := v_informed - v_expected;
  v_summary := v_summary || jsonb_build_object(
    'expected_cash', v_expected,
    'informed_amount', v_informed,
    'difference', v_difference,
    'closing_note', v_closing_note
  );

  update public.cash_registers
  set
    status = 'closed',
    closed_by = public.current_app_user_id(),
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
    created_by,
    metadata
  ) values (
    v_cash_id,
    'closing',
    'cash',
    v_informed,
    v_closing_note,
    public.current_app_user_id(),
    jsonb_build_object(
      'expected_amount', v_expected,
      'difference', v_difference,
      'summary', v_summary
    )
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

grant execute on function public.rpc_close_cash_register(jsonb) to authenticated;
