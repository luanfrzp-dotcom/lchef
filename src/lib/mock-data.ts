// Dados simulados — L'Chef Café
export const KPIS = {
  faturamentoDia: 2847.5,
  faturamentoMes: 78420.9,
  lucroBruto: 41320.4,
  margemBruta: 52.7,
  cmv: 32.1,
  ticketMedio: 38.5,
  pedidos: 2034,
  saldoCaixa: 12480.3,
  despesasMes: 28110.2,
  contasReceber: 8420.0,
  contasPagarVencendo: 3210.5,
  variacaoMes: 12.4,
};

export const VENDAS_DIARIAS = [
  { dia: "Seg", vendas: 2100, despesas: 800 },
  { dia: "Ter", vendas: 2450, despesas: 750 },
  { dia: "Qua", vendas: 2890, despesas: 920 },
  { dia: "Qui", vendas: 3120, despesas: 870 },
  { dia: "Sex", vendas: 4210, despesas: 1100 },
  { dia: "Sáb", vendas: 5320, despesas: 1340 },
  { dia: "Dom", vendas: 4180, despesas: 1020 },
];

export const VENDAS_CANAL = [
  { canal: "Loja Física", valor: 42300 },
  { canal: "iFood", valor: 18420 },
  { canal: "WhatsApp", valor: 9120 },
  { canal: "Delivery Próprio", valor: 5430 },
  { canal: "Encomendas", valor: 3150 },
];

export const CATEGORIAS_VENDAS = [
  { nome: "Cafés", valor: 28400 },
  { nome: "Doces & Bolos", valor: 19800 },
  { nome: "Chocolates", valor: 14200 },
  { nome: "Salgados", valor: 9800 },
  { nome: "Bebidas Geladas", valor: 6220 },
];

export type Produto = {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  custo: number;
  estoque: number;
  estoqueMin: number;
  margem: number;
  status: "ativo" | "inativo";
};

export const PRODUTOS: Produto[] = [
  { id: "P001", nome: "Espresso", categoria: "Cafés", preco: 7.5, custo: 1.8, estoque: 999, estoqueMin: 0, margem: 76, status: "ativo" },
  { id: "P002", nome: "Cappuccino L'Chef", categoria: "Cafés", preco: 14.0, custo: 4.2, estoque: 999, estoqueMin: 0, margem: 70, status: "ativo" },
  { id: "P003", nome: "Café Coado Especial", categoria: "Cafés", preco: 9.0, custo: 2.1, estoque: 999, estoqueMin: 0, margem: 76.7, status: "ativo" },
  { id: "P004", nome: "Chocolate Quente Amazônico", categoria: "Bebidas Quentes", preco: 16.0, custo: 5.4, estoque: 999, estoqueMin: 0, margem: 66.3, status: "ativo" },
  { id: "P005", nome: "Brownie Bean-to-Bar", categoria: "Doces", preco: 18.0, custo: 5.1, estoque: 42, estoqueMin: 20, margem: 71.7, status: "ativo" },
  { id: "P006", nome: "Cookie de Chocolate", categoria: "Doces", preco: 12.0, custo: 2.8, estoque: 18, estoqueMin: 20, margem: 76.7, status: "ativo" },
  { id: "P007", nome: "Bolo de Cenoura c/ Ganache", categoria: "Bolos", preco: 22.0, custo: 7.2, estoque: 9, estoqueMin: 8, margem: 67.3, status: "ativo" },
  { id: "P008", nome: "Torta de Chocolate", categoria: "Bolos", preco: 24.0, custo: 9.4, estoque: 6, estoqueMin: 5, margem: 60.8, status: "ativo" },
  { id: "P009", nome: "Croissant", categoria: "Salgados", preco: 11.0, custo: 3.6, estoque: 24, estoqueMin: 15, margem: 67.3, status: "ativo" },
  { id: "P010", nome: "Pão de Queijo", categoria: "Salgados", preco: 6.0, custo: 1.5, estoque: 80, estoqueMin: 30, margem: 75.0, status: "ativo" },
  { id: "P011", nome: "Caixa de Chocolates Artesanais", categoria: "Chocolates", preco: 68.0, custo: 24.0, estoque: 12, estoqueMin: 10, margem: 64.7, status: "ativo" },
  { id: "P012", nome: "Combo Café + Doce", categoria: "Combos", preco: 19.9, custo: 6.4, estoque: 999, estoqueMin: 0, margem: 67.8, status: "ativo" },
];

export const CATEGORIAS_PRODUTO = [
  "Cafés","Bebidas Quentes","Bebidas Geladas","Chocolates","Doces","Bolos","Tortas","Salgados","Sobremesas","Combos","Presentes","Embalagens","Insumos","Outros",
];

export type Pedido = {
  id: string;
  cliente: string;
  canal: string;
  itens: number;
  total: number;
  status: "novo" | "em-preparo" | "pronto" | "saiu-entrega" | "entregue" | "cancelado";
  hora: string;
  pagamento: string;
};

export const PEDIDOS: Pedido[] = [
  { id: "#1042", cliente: "Maria S.", canal: "Loja Física", itens: 3, total: 42.5, status: "novo", hora: "10:12", pagamento: "PIX" },
  { id: "#1043", cliente: "João P.", canal: "iFood", itens: 2, total: 31.0, status: "em-preparo", hora: "10:18", pagamento: "Crédito" },
  { id: "#1044", cliente: "Ana L.", canal: "WhatsApp", itens: 5, total: 89.9, status: "em-preparo", hora: "10:21", pagamento: "PIX" },
  { id: "#1045", cliente: "Balcão", canal: "Loja Física", itens: 1, total: 14.0, status: "pronto", hora: "10:25", pagamento: "Dinheiro" },
  { id: "#1046", cliente: "Carlos M.", canal: "Delivery Próprio", itens: 4, total: 76.0, status: "saiu-entrega", hora: "10:02", pagamento: "Crédito" },
  { id: "#1047", cliente: "Patrícia R.", canal: "Encomenda", itens: 1, total: 180.0, status: "entregue", hora: "09:40", pagamento: "PIX" },
  { id: "#1048", cliente: "Visitante", canal: "Loja Física", itens: 2, total: 21.0, status: "cancelado", hora: "09:55", pagamento: "—" },
];

export const ESTOQUE = [
  { item: "Café em grão (Especial)", categoria: "Café", qtd: 8.5, un: "kg", min: 5, custo: 75, validade: "2026-08-12" },
  { item: "Leite Integral", categoria: "Laticínios", qtd: 32, un: "L", min: 20, custo: 6.5, validade: "2026-06-04" },
  { item: "Chocolate 70% (Bean-to-Bar)", categoria: "Chocolate", qtd: 4.2, un: "kg", min: 5, custo: 180, validade: "2026-12-01" },
  { item: "Farinha de Trigo", categoria: "Farinha", qtd: 22, un: "kg", min: 10, custo: 6.2, validade: "2026-09-15" },
  { item: "Açúcar Refinado", categoria: "Açúcar", qtd: 15, un: "kg", min: 8, custo: 4.8, validade: "2027-01-20" },
  { item: "Cacau em pó", categoria: "Cacau", qtd: 2.1, un: "kg", min: 3, custo: 95, validade: "2026-07-30" },
  { item: "Caixa Presente Premium", categoria: "Embalagens", qtd: 48, un: "un", min: 30, custo: 4.2, validade: "—" },
];

export const FORNECEDORES = [
  { nome: "Fazenda Aurora", cnpj: "12.345.678/0001-90", categoria: "Café", prazo: "30 dias", status: "ativo" },
  { nome: "Cacau Amazônico Ltda", cnpj: "23.456.789/0001-12", categoria: "Chocolate", prazo: "21 dias", status: "ativo" },
  { nome: "Laticínios Bela Vista", cnpj: "34.567.890/0001-22", categoria: "Laticínios", prazo: "15 dias", status: "ativo" },
  { nome: "Embalagens Premium", cnpj: "45.678.901/0001-33", categoria: "Embalagens", prazo: "30 dias", status: "ativo" },
  { nome: "Distribuidora Central", cnpj: "56.789.012/0001-44", categoria: "Diversos", prazo: "28 dias", status: "ativo" },
];

export const CLIENTES = [
  { nome: "Maria Silva", tel: "(11) 98123-4567", ticket: 48.2, totalGasto: 1240.0, ultima: "2026-05-26" },
  { nome: "João Pereira", tel: "(11) 97456-1122", ticket: 32.5, totalGasto: 980.0, ultima: "2026-05-25" },
  { nome: "Ana Lima", tel: "(11) 99012-8877", ticket: 65.0, totalGasto: 2890.0, ultima: "2026-05-27" },
  { nome: "Carlos Mendes", tel: "(11) 96333-2244", ticket: 41.8, totalGasto: 760.0, ultima: "2026-05-20" },
  { nome: "Patrícia Rocha", tel: "(11) 95111-9988", ticket: 120.0, totalGasto: 3420.0, ultima: "2026-05-22" },
];

export const FUNCIONARIOS = [
  { nome: "Renata Alves", cargo: "Gerente", admissao: "2024-03-10", status: "ativo" },
  { nome: "Bruno Castro", cargo: "Barista Chefe", admissao: "2024-06-22", status: "ativo" },
  { nome: "Camila Duarte", cargo: "Confeiteira", admissao: "2025-01-15", status: "ativo" },
  { nome: "Diego Lopes", cargo: "Atendente / Caixa", admissao: "2025-08-04", status: "ativo" },
  { nome: "Elaine Souza", cargo: "Financeiro", admissao: "2024-11-02", status: "ativo" },
];

export const CONTAS_PAGAR = [
  { desc: "Fazenda Aurora — Café", venc: "2026-05-30", valor: 1280.0, status: "a-vencer" },
  { desc: "Aluguel — Maio", venc: "2026-05-28", valor: 4800.0, status: "a-vencer" },
  { desc: "Energia Elétrica", venc: "2026-05-29", valor: 920.0, status: "a-vencer" },
  { desc: "Embalagens Premium", venc: "2026-06-05", valor: 640.0, status: "a-vencer" },
  { desc: "Contador", venc: "2026-05-25", valor: 850.0, status: "vencida" },
];

export const CONTAS_RECEBER = [
  { desc: "Encomenda Casamento Rocha", venc: "2026-06-02", valor: 1800.0, status: "a-receber" },
  { desc: "Evento Corporativo XPTO", venc: "2026-06-10", valor: 4200.0, status: "a-receber" },
  { desc: "Fiado — Cliente Ana L.", venc: "2026-05-29", valor: 420.0, status: "a-receber" },
];

export const DRE = [
  { linha: "Receita Bruta", valor: 78420.9, tipo: "receita" },
  { linha: "(-) Taxas de Cartão", valor: -2350.6, tipo: "deducao" },
  { linha: "(-) Taxas de Delivery", valor: -1840.3, tipo: "deducao" },
  { linha: "Receita Líquida", valor: 74230.0, tipo: "subtotal" },
  { linha: "(-) CMV", valor: -23830.0, tipo: "custo" },
  { linha: "Lucro Bruto", valor: 50400.0, tipo: "subtotal" },
  { linha: "(-) Folha de Pagamento", valor: -14200.0, tipo: "despesa" },
  { linha: "(-) Aluguel", valor: -4800.0, tipo: "despesa" },
  { linha: "(-) Marketing", valor: -1800.0, tipo: "despesa" },
  { linha: "(-) Outras Despesas Operacionais", valor: -5310.2, tipo: "despesa" },
  { linha: "EBITDA", valor: 24289.8, tipo: "subtotal" },
  { linha: "(-) Impostos", valor: -6280.0, tipo: "despesa" },
  { linha: "Lucro Líquido", valor: 18009.8, tipo: "total" },
];

export const INTEGRACOES = [
  { nome: "iFood", status: "conectado" },
  { nome: "WhatsApp Business", status: "pendente" },
  { nome: "Bling ERP", status: "não-configurado" },
  { nome: "OpenAI", status: "não-configurado" },
  { nome: "Emissor NFC-e", status: "pendente" },
  { nome: "Gateway de Pagamento", status: "conectado" },
  { nome: "Google Sheets", status: "não-configurado" },
  { nome: "Power BI", status: "não-configurado" },
];

export const UNIDADES = ["L'Chef Café", "L'Chef Chocolateria", "Grupo L'Chef"];

export const AUDIT_LOGS = [
  { quando: "27/05 10:24", usuario: "Diego Lopes", acao: "Abriu caixa", detalhe: "Caixa #04 — fundo R$ 200,00" },
  { quando: "27/05 10:18", usuario: "Renata Alves", acao: "Alterou preço", detalhe: "Cappuccino L'Chef: R$ 13,00 → R$ 14,00" },
  { quando: "27/05 09:55", usuario: "Diego Lopes", acao: "Cancelou venda", detalhe: "Pedido #1048 — motivo: cliente desistiu" },
  { quando: "27/05 09:30", usuario: "Bruno Castro", acao: "Baixa de estoque", detalhe: "Café especial: -2,5kg (produção)" },
  { quando: "26/05 18:10", usuario: "Elaine Souza", acao: "Pagou conta", detalhe: "Energia Elétrica — R$ 920,00" },
];
