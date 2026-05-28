insert into public.roles (id, name) values
  ('admin', 'Administrador'),
  ('manager', 'Gerente'),
  ('cashier', 'Caixa'),
  ('kitchen', 'Cozinha/Producao'),
  ('finance', 'Financeiro'),
  ('accountant', 'Contador')
on conflict (id) do update set name = excluded.name;

insert into public.permissions (id, name) values
  ('dashboard:view', 'Ver dashboard'),
  ('pdv:operate', 'Operar PDV'),
  ('orders:manage', 'Gerenciar pedidos'),
  ('kitchen:manage', 'Gerenciar cozinha'),
  ('catalog:manage', 'Gerenciar produtos e fichas tecnicas'),
  ('inventory:manage', 'Gerenciar estoque'),
  ('purchases:manage', 'Gerenciar compras'),
  ('finance:manage', 'Gerenciar financeiro'),
  ('reports:view', 'Ver relatorios'),
  ('accounting:view', 'Ver painel do contador'),
  ('settings:manage', 'Gerenciar configuracoes'),
  ('users:manage', 'Gerenciar usuarios'),
  ('audit:view', 'Ver auditoria')
on conflict (id) do update set name = excluded.name;

insert into public.role_permissions (role_id, permission_id)
select role_id, permission_id
from (values
  ('admin','dashboard:view'), ('admin','pdv:operate'), ('admin','orders:manage'), ('admin','kitchen:manage'),
  ('admin','catalog:manage'), ('admin','inventory:manage'), ('admin','purchases:manage'), ('admin','finance:manage'),
  ('admin','reports:view'), ('admin','accounting:view'), ('admin','settings:manage'), ('admin','users:manage'), ('admin','audit:view'),
  ('manager','dashboard:view'), ('manager','pdv:operate'), ('manager','orders:manage'), ('manager','kitchen:manage'),
  ('manager','catalog:manage'), ('manager','inventory:manage'), ('manager','purchases:manage'), ('manager','reports:view'),
  ('cashier','dashboard:view'), ('cashier','pdv:operate'), ('cashier','orders:manage'),
  ('kitchen','kitchen:manage'), ('kitchen','catalog:manage'),
  ('finance','dashboard:view'), ('finance','finance:manage'), ('finance','reports:view'),
  ('accountant','accounting:view'), ('accountant','reports:view')
) as data(role_id, permission_id)
on conflict do nothing;

insert into public.units (id, name, document, address, active) values
  ('00000000-0000-4000-8000-000000000001', 'L''Chef Cafe', '12.345.678/0001-90', 'Rua das Camelias, 123 - Sao Paulo/SP', true),
  ('00000000-0000-4000-8000-000000000002', 'L''Chef Chocolateria', '12.345.678/0002-71', 'Rua Bela Vista, 88 - Sao Paulo/SP', true)
on conflict (id) do update set name = excluded.name, document = excluded.document, address = excluded.address, active = excluded.active;

insert into public.users (id, name, email, role_id, unit_id, active) values
  ('00000000-0000-4000-8000-000000000101', 'Renata Alves', 'renata@lchef.com.br', 'admin', '00000000-0000-4000-8000-000000000001', true),
  ('00000000-0000-4000-8000-000000000102', 'Bruno Castro', 'bruno@lchef.com.br', 'manager', '00000000-0000-4000-8000-000000000001', true),
  ('00000000-0000-4000-8000-000000000103', 'Diego Lopes', 'caixa@lchef.com.br', 'cashier', '00000000-0000-4000-8000-000000000001', true),
  ('00000000-0000-4000-8000-000000000104', 'Camila Duarte', 'cozinha@lchef.com.br', 'kitchen', '00000000-0000-4000-8000-000000000001', true),
  ('00000000-0000-4000-8000-000000000105', 'Elaine Souza', 'financeiro@lchef.com.br', 'finance', '00000000-0000-4000-8000-000000000001', true),
  ('00000000-0000-4000-8000-000000000106', 'Contabilidade L''Chef', 'contador@lchef.com.br', 'accountant', '00000000-0000-4000-8000-000000000001', true)
on conflict (id) do update set name = excluded.name, email = excluded.email, role_id = excluded.role_id, unit_id = excluded.unit_id, active = excluded.active;

insert into public.product_categories (id, name, active) values
  ('00000000-0000-4000-8000-000000000201', 'Cafes', true),
  ('00000000-0000-4000-8000-000000000202', 'Bebidas Quentes', true),
  ('00000000-0000-4000-8000-000000000203', 'Doces', true),
  ('00000000-0000-4000-8000-000000000204', 'Bolos', true),
  ('00000000-0000-4000-8000-000000000205', 'Salgados', true),
  ('00000000-0000-4000-8000-000000000206', 'Chocolates', true)
on conflict (id) do update set name = excluded.name, active = excluded.active;

insert into public.inventory_items (id, unit_id, name, category, quantity, measure_unit, min_quantity, unit_cost, expires_at, lot) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', 'Cafe especial', 'Cafe', 8.5, 'kg', 5, 75, '2026-08-12', 'CAF-2605'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', 'Leite', 'Laticinios', 32, 'L', 20, 6.5, '2026-06-04', 'LEI-0527'),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000001', 'Chocolate', 'Chocolate', 4.2, 'kg', 5, 180, '2026-12-01', 'CHO-70'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000001', 'Cacau', 'Cacau', 2.1, 'kg', 3, 95, '2026-07-30', 'CAC-0626'),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000001', 'Acucar', 'Secos', 15, 'kg', 8, 4.8, '2027-01-20', null),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000001', 'Farinha', 'Secos', 22, 'kg', 10, 6.2, '2026-09-15', null),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000001', 'Manteiga', 'Laticinios', 9, 'kg', 4, 50, '2026-06-20', null),
  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000001', 'Ovos', 'Frescos', 180, 'un', 60, 1, '2026-06-10', null),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000001', 'Creme de leite', 'Laticinios', 16, 'L', 6, 14, '2026-06-14', null),
  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000001', 'Embalagens', 'Embalagens', 48, 'un', 30, 4.2, null, null),
  ('00000000-0000-4000-8000-000000000311', '00000000-0000-4000-8000-000000000001', 'Croissant cru', 'Congelados', 24, 'un', 15, 3.6, '2026-06-30', null),
  ('00000000-0000-4000-8000-000000000312', '00000000-0000-4000-8000-000000000001', 'Pao de queijo congelado', 'Congelados', 80, 'un', 30, 1.5, '2026-07-15', null)
on conflict (id) do update set quantity = excluded.quantity, unit_cost = excluded.unit_cost, min_quantity = excluded.min_quantity;

insert into public.products (id, unit_id, category_id, name, sku, type, price, cost, stock, stock_min, active) values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000201', 'Espresso', 'ESP-001', 'finished', 7.50, 1.80, 999, 0, true),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000201', 'Cappuccino L''Chef', 'CAP-001', 'finished', 14.00, 4.20, 999, 0, true),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000202', 'Chocolate Quente Amazonico', 'CHOQ-001', 'finished', 16.00, 5.40, 999, 0, true),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000203', 'Brownie Bean-to-Bar', 'BRO-001', 'finished', 18.00, 5.10, 42, 20, true),
  ('00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000203', 'Cookie de Chocolate', 'COO-001', 'finished', 12.00, 2.80, 18, 20, true),
  ('00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000204', 'Bolo de Cenoura com Ganache', 'BOL-001', 'finished', 22.00, 7.20, 9, 8, true),
  ('00000000-0000-4000-8000-000000000407', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000201', 'Cafe Coado Especial', 'COA-001', 'finished', 9.00, 2.10, 999, 0, true),
  ('00000000-0000-4000-8000-000000000408', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000205', 'Croissant', 'CRO-001', 'finished', 11.00, 3.60, 24, 15, true),
  ('00000000-0000-4000-8000-000000000409', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000205', 'Pao de Queijo', 'PDQ-001', 'finished', 6.00, 1.50, 80, 30, true),
  ('00000000-0000-4000-8000-000000000410', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000206', 'Caixa de Chocolates Artesanais', 'CCH-001', 'finished', 68.00, 24.00, 12, 10, true)
on conflict (id) do update set price = excluded.price, cost = excluded.cost, stock = excluded.stock, stock_min = excluded.stock_min, active = excluded.active;

insert into public.recipes (id, product_id, name, yield_qty, version, preparation, validity_days, desired_margin) values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000401', 'Espresso', 1, 'v1.0', 'Moer cafe fresco e extrair 30 ml.', 0, 70),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000402', 'Cappuccino L''Chef', 1, 'v1.2', 'Extrair espresso, vaporizar leite e finalizar com cacau.', 0, 68),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000403', 'Chocolate Quente Amazonico', 1, 'v1.1', 'Aquecer leite, chocolate e cacau ate textura cremosa.', 0, 66),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000404', 'Brownie Bean-to-Bar', 20, 'v2.3', 'Misturar secos e chocolate derretido, assar por 28 minutos.', 5, 70),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000405', 'Cookie de Chocolate', 24, 'v1.4', 'Porcionar massa gelada e assar sob demanda.', 4, 72),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000406', 'Bolo de Cenoura com Ganache', 12, 'v1.0', 'Assar bolo em forma alta e cobrir com ganache.', 3, 66),
  ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000407', 'Cafe Coado Especial', 1, 'v1.0', 'Coar em V60 com agua a 93 C.', 0, 70),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000408', 'Croissant', 1, 'v1.0', 'Assar croissant congelado ate dourar.', 1, 65),
  ('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000409', 'Pao de Queijo', 1, 'v1.0', 'Assar porcoes congeladas por 18 minutos.', 1, 70),
  ('00000000-0000-4000-8000-000000000510', '00000000-0000-4000-8000-000000000410', 'Caixa de Chocolates Artesanais', 1, 'v1.0', 'Montar caixa com bombons sortidos e embalagem premium.', 30, 62)
on conflict (id) do update set version = excluded.version, preparation = excluded.preparation, desired_margin = excluded.desired_margin;

insert into public.recipe_items (recipe_id, inventory_item_id, quantity, measure_unit) values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000301', 0.012, 'kg'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000301', 0.012, 'kg'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000302', 0.18, 'L'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000304', 0.006, 'kg'),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000302', 0.22, 'L'),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000303', 0.018, 'kg'),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000304', 0.006, 'kg'),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000305', 0.012, 'kg'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000303', 0.4, 'kg'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000307', 0.25, 'kg'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000305', 0.3, 'kg'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000306', 0.18, 'kg'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000308', 4, 'un'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000310', 20, 'un'),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000311', 1, 'un'),
  ('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000312', 1, 'un')
on conflict do nothing;

insert into public.suppliers (id, name, document, category, payment_terms, active) values
  ('00000000-0000-4000-8000-000000000601', 'Fazenda Aurora', '12.345.678/0001-90', 'Cafe', '30 dias', true),
  ('00000000-0000-4000-8000-000000000602', 'Cacau Amazonico Ltda', '23.456.789/0001-12', 'Chocolate', '21 dias', true),
  ('00000000-0000-4000-8000-000000000603', 'Laticinios Bela Vista', '34.567.890/0001-22', 'Laticinios', '15 dias', true),
  ('00000000-0000-4000-8000-000000000604', 'Embalagens Premium', '45.678.901/0001-33', 'Embalagens', '30 dias', true)
on conflict (id) do update set name = excluded.name, document = excluded.document, category = excluded.category, payment_terms = excluded.payment_terms;

insert into public.customers (id, name, phone, total_spent, average_ticket, last_purchase_at) values
  ('00000000-0000-4000-8000-000000000701', 'Maria Silva', '(11) 98123-4567', 1240, 48.20, now()),
  ('00000000-0000-4000-8000-000000000702', 'Joao Pereira', '(11) 97456-1122', 980, 32.50, now()),
  ('00000000-0000-4000-8000-000000000703', 'Ana Lima', '(11) 99012-8877', 2890, 65.00, now())
on conflict (id) do update set total_spent = excluded.total_spent, average_ticket = excluded.average_ticket, last_purchase_at = excluded.last_purchase_at;

insert into public.financial_categories (id, name, type, dre_group) values
  ('00000000-0000-4000-8000-000000000801', 'Vendas', 'revenue', 'receita_bruta'),
  ('00000000-0000-4000-8000-000000000802', 'Eventos', 'revenue', 'receita_bruta'),
  ('00000000-0000-4000-8000-000000000803', 'Administrativo', 'expense', 'administrativas'),
  ('00000000-0000-4000-8000-000000000804', 'Folha', 'expense', 'folha'),
  ('00000000-0000-4000-8000-000000000805', 'Marketing', 'expense', 'marketing'),
  ('00000000-0000-4000-8000-000000000806', 'Impostos', 'expense', 'impostos'),
  ('00000000-0000-4000-8000-000000000807', 'Compras', 'expense', 'cmv')
on conflict (id) do update set name = excluded.name, type = excluded.type, dre_group = excluded.dre_group;

insert into public.cost_centers (id, name) values
  ('00000000-0000-4000-8000-000000000901', 'Loja'),
  ('00000000-0000-4000-8000-000000000902', 'Backoffice'),
  ('00000000-0000-4000-8000-000000000903', 'Operacao'),
  ('00000000-0000-4000-8000-000000000904', 'Comercial'),
  ('00000000-0000-4000-8000-000000000905', 'Confeitaria'),
  ('00000000-0000-4000-8000-000000000906', 'Fiscal'),
  ('00000000-0000-4000-8000-000000000907', 'Estoque')
on conflict (id) do update set name = excluded.name;

insert into public.expenses (id, category_id, cost_center_id, description, amount, status, competence_date, due_date, paid_at) values
  ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000803', '00000000-0000-4000-8000-000000000901', 'Aluguel - Maio', 4800, 'open', current_date, current_date + interval '1 day', null),
  ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000803', '00000000-0000-4000-8000-000000000901', 'Energia eletrica', 920, 'open', current_date, current_date + interval '2 day', null),
  ('00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000804', '00000000-0000-4000-8000-000000000903', 'Folha de pagamento', 14200, 'paid', current_date, current_date - interval '20 day', now() - interval '20 day'),
  ('00000000-0000-4000-8000-000000001004', '00000000-0000-4000-8000-000000000805', '00000000-0000-4000-8000-000000000904', 'Campanha Dia dos Namorados', 1800, 'paid', current_date, current_date - interval '8 day', now() - interval '8 day'),
  ('00000000-0000-4000-8000-000000001005', '00000000-0000-4000-8000-000000000806', '00000000-0000-4000-8000-000000000906', 'Impostos estimados', 6280, 'open', current_date, current_date + interval '3 day', null)
on conflict (id) do update set amount = excluded.amount, status = excluded.status, due_date = excluded.due_date, paid_at = excluded.paid_at;

insert into public.revenues (id, category_id, cost_center_id, description, amount, status, competence_date, due_date) values
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000000802', '00000000-0000-4000-8000-000000000904', 'Evento corporativo XPTO', 4200, 'open', current_date, current_date + interval '3 day'),
  ('00000000-0000-4000-8000-000000001102', '00000000-0000-4000-8000-000000000802', '00000000-0000-4000-8000-000000000905', 'Encomenda casamento Rocha', 1800, 'open', current_date, current_date + interval '2 day')
on conflict (id) do update set amount = excluded.amount, status = excluded.status, due_date = excluded.due_date;

insert into public.accounts_payable (id, expense_id, description, amount, status, competence_date, due_date)
select id, id, description, amount, status, competence_date, due_date
from public.expenses
on conflict (id) do update set amount = excluded.amount, status = excluded.status, due_date = excluded.due_date;

insert into public.accounts_receivable (id, revenue_id, description, amount, status, competence_date, due_date)
select id, id, description, amount, status, competence_date, due_date
from public.revenues
on conflict (id) do update set amount = excluded.amount, status = excluded.status, due_date = excluded.due_date;

insert into public.purchases (id, supplier_id, unit_id, invoice_number, status, payment_status, payment_terms, total, received_at, paid_at) values
  ('00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000001', 'NF-00123', 'received', 'open', 'Boleto 30 dias', 1280, now() - interval '5 day', null),
  ('00000000-0000-4000-8000-000000001202', '00000000-0000-4000-8000-000000000603', '00000000-0000-4000-8000-000000000001', 'NF-00876', 'paid', 'paid', 'PIX', 740, now() - interval '7 day', now() - interval '7 day'),
  ('00000000-0000-4000-8000-000000001203', '00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000001', 'NF-01234', 'order', 'open', 'Boleto 21 dias', 2150, null, null),
  ('00000000-0000-4000-8000-000000001204', '00000000-0000-4000-8000-000000000604', '00000000-0000-4000-8000-000000000001', 'NF-00422', 'paid', 'paid', 'Cartao', 640, now() - interval '10 day', now() - interval '10 day')
on conflict (id) do update set status = excluded.status, payment_status = excluded.payment_status, total = excluded.total;

insert into public.purchase_items (purchase_id, inventory_item_id, quantity, measure_unit, unit_cost) values
  ('00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000000301', 12, 'kg', 75),
  ('00000000-0000-4000-8000-000000001202', '00000000-0000-4000-8000-000000000302', 80, 'L', 6.5),
  ('00000000-0000-4000-8000-000000001202', '00000000-0000-4000-8000-000000000309', 10, 'L', 14),
  ('00000000-0000-4000-8000-000000001203', '00000000-0000-4000-8000-000000000303', 8, 'kg', 180),
  ('00000000-0000-4000-8000-000000001203', '00000000-0000-4000-8000-000000000304', 5, 'kg', 95),
  ('00000000-0000-4000-8000-000000001204', '00000000-0000-4000-8000-000000000310', 160, 'un', 4.2)
on conflict do nothing;

insert into public.employees (id, user_id, name, role, hired_at, status) values
  ('00000000-0000-4000-8000-000000001301', '00000000-0000-4000-8000-000000000101', 'Renata Alves', 'Gerente', '2024-03-10', 'active'),
  ('00000000-0000-4000-8000-000000001302', '00000000-0000-4000-8000-000000000102', 'Bruno Castro', 'Barista Chefe', '2024-06-22', 'active'),
  ('00000000-0000-4000-8000-000000001303', '00000000-0000-4000-8000-000000000104', 'Camila Duarte', 'Confeiteira', '2025-01-15', 'active'),
  ('00000000-0000-4000-8000-000000001304', '00000000-0000-4000-8000-000000000103', 'Diego Lopes', 'Atendente / Caixa', '2025-08-04', 'active'),
  ('00000000-0000-4000-8000-000000001305', '00000000-0000-4000-8000-000000000105', 'Elaine Souza', 'Financeiro', '2024-11-02', 'active')
on conflict (id) do update set name = excluded.name, role = excluded.role, status = excluded.status;

insert into public.settings (key, value) values
  ('company', '{"name":"L''Chef Cafe Ltda","document":"12.345.678/0001-90","currency":"BRL"}'::jsonb),
  ('pdv', '{"require_open_cash":true,"allow_negative_stock":false,"receipt_footer":"Obrigado pela preferencia"}'::jsonb),
  ('finance', '{"default_margin":65,"tax_rate_estimate":8}'::jsonb)
on conflict (key) do update set value = excluded.value;

insert into public.audit_logs (id, user_id, action, details, entity) values
  ('00000000-0000-4000-8000-000000001401', '00000000-0000-4000-8000-000000000101', 'Seed carregado', 'Dados realistas do L''Chef Cafe disponiveis para testes internos.', 'settings')
on conflict (id) do update set details = excluded.details;
