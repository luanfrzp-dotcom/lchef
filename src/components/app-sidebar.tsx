import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  Boxes,
  Building2,
  ChefHat,
  ClipboardList,
  Coffee,
  FileBarChart,
  FileSpreadsheet,
  LayoutDashboard,
  LineChart,
  Package,
  Plug,
  ScrollText,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Truck,
  UserCircle2,
  Users2,
  Wallet,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useBusiness } from "@/lib/store";

const groups = [
  {
    label: "Operacao",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/pdv", label: "PDV", icon: ShoppingCart },
      { to: "/pedidos", label: "Pedidos", icon: ClipboardList },
      { to: "/cozinha", label: "Cozinha / Producao", icon: ChefHat },
    ],
  },
  {
    label: "Catalogo & Estoque",
    items: [
      { to: "/produtos", label: "Produtos", icon: Package },
      { to: "/fichas-tecnicas", label: "Fichas Tecnicas", icon: BookOpen },
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
      { to: "/funcionarios", label: "Funcionarios", icon: UserCircle2 },
    ],
  },
  {
    label: "Gestao",
    items: [
      { to: "/relatorios", label: "Relatorios", icon: FileBarChart },
      { to: "/contador", label: "Painel do Contador", icon: FileSpreadsheet },
      { to: "/analise", label: "Analise Inteligente", icon: Sparkles },
      { to: "/integracoes", label: "Integracoes", icon: Plug },
      { to: "/configuracoes", label: "Configuracoes", icon: Settings },
      { to: "/usuarios", label: "Usuarios & Permissoes", icon: Shield },
      { to: "/auditoria", label: "Auditoria / Logs", icon: ScrollText },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { canAccess } = useBusiness();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[color:var(--gold)] text-[color:var(--primary)]">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-sidebar-foreground">
              L'Chef Cafe
            </div>
            <div className="text-[11px] text-sidebar-foreground/70">ERP - PDV - Gestao</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => {
          const items = group.items.filter((item) => canAccess(item.to));
          if (!items.length) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.to;
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link to={item.to}>
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 text-[11px] text-sidebar-foreground/60">
          Unidade: <span className="text-sidebar-foreground">L'Chef Cafe</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
