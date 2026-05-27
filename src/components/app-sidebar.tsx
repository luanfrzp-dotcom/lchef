import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingCart, ClipboardList, ChefHat, Package, BookOpen,
  Boxes, Truck, Users2, Wallet, ArrowDownCircle, ArrowUpCircle, LineChart,
  FileBarChart, UserCircle2, Sparkles, Plug, Settings, Shield, ScrollText,
  Building2, FileSpreadsheet, Coffee,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";

const groups: { label: string; items: { to: string; label: string; icon: any }[] }[] = [
  {
    label: "Operação",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/pdv", label: "PDV", icon: ShoppingCart },
      { to: "/pedidos", label: "Pedidos", icon: ClipboardList },
      { to: "/cozinha", label: "Cozinha / Produção", icon: ChefHat },
    ],
  },
  {
    label: "Catálogo & Estoque",
    items: [
      { to: "/produtos", label: "Produtos", icon: Package },
      { to: "/fichas-tecnicas", label: "Fichas Técnicas", icon: BookOpen },
      { to: "/estoque", label: "Estoque", icon: Boxes },
      { to: "/compras", label: "Compras", icon: Truck },
      { to: "/fornecedores", label: "Fornecedores", icon: Building2 },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { to: "/financeiro", label: "Financeiro", icon: Wallet },
      { to: "/contas-pagar", label: "Contas a Pagar", icon: ArrowDownCircle },
      { to: "/contas-receber", label: "Contas a Receber", icon: ArrowUpCircle },
      { to: "/fluxo-caixa", label: "Fluxo de Caixa", icon: LineChart },
      { to: "/dre", label: "DRE Gerencial", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Pessoas",
    items: [
      { to: "/clientes", label: "Clientes", icon: Users2 },
      { to: "/funcionarios", label: "Funcionários", icon: UserCircle2 },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
      { to: "/contador", label: "Painel do Contador", icon: FileSpreadsheet },
      { to: "/analise", label: "Análise Inteligente", icon: Sparkles },
      { to: "/integracoes", label: "Integrações", icon: Plug },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
      { to: "/usuarios", label: "Usuários & Permissões", icon: Shield },
      { to: "/auditoria", label: "Auditoria / Logs", icon: ScrollText },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[color:var(--gold)] text-[color:var(--primary)]">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-sidebar-foreground">L'Chef Café</div>
            <div className="text-[11px] text-sidebar-foreground/70">ERP · PDV · Gestão</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const active = pathname === it.to;
                  return (
                    <SidebarMenuItem key={it.to}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={it.to}>
                          <Icon className="h-4 w-4" />
                          <span>{it.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 text-[11px] text-sidebar-foreground/60">
          Unidade: <span className="text-sidebar-foreground">L'Chef Café</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
