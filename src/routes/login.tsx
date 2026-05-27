import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar · L'Chef Café" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="grid min-h-screen place-items-center bg-[color:var(--secondary)] p-4">
      <Card className="w-full max-w-sm border-[color:var(--gold)]/40 shadow-xl">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--primary)] text-[color:var(--gold)]">
              <Coffee className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold text-[color:var(--primary)]">L'Chef Café</h1>
            <p className="text-xs text-muted-foreground">Sistema de gestão · ERP & PDV</p>
          </div>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div><Label>E-mail</Label><Input type="email" defaultValue="renata@lchef.com.br" /></div>
            <div><Label>Senha</Label><Input type="password" defaultValue="••••••••" /></div>
            <Button asChild className="w-full bg-[color:var(--primary)] hover:bg-[color:var(--primary)]/90">
              <Link to="/">Entrar</Link>
            </Button>
          </form>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">© L'Chef Café · Grupo L'Chef</p>
        </CardContent>
      </Card>
    </div>
  );
}
