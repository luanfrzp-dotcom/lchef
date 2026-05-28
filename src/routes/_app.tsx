import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/domain";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { currentUser, hydrated, canAccess, logout } = useBusiness();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Carregando L'Chef...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!canAccess(pathname)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="max-w-md rounded-md border bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu perfil nao tem permissao para acessar esta area.
          </p>
          <Button className="mt-4" variant="outline" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    );
  }

  const initials = currentUser.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar produtos, pedidos, clientes..." className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-md p-2 hover:bg-muted" aria-label="Notificacoes">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[color:var(--gold)]" />
            </button>
            <div className="hidden text-right sm:block">
              <div className="text-xs font-medium">{currentUser.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {ROLE_LABELS[currentUser.role]}
              </div>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[color:var(--gold)] text-[color:var(--primary)] text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button size="sm" variant="ghost" onClick={logout}>
              Sair
            </Button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
