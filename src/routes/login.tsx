import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import { useBusiness } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar - L'Chef Cafe" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login, state } = useBusiness();
  const [email, setEmail] = useState("renata@lchef.com.br");
  const [password, setPassword] = useState("lchef123");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = await login(email, password);
    if (!ok) {
      setError("E-mail ou senha invalidos para o ambiente de teste.");
      return;
    }
    navigate({ to: "/" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[color:var(--secondary)] p-4">
      <Card className="w-full max-w-sm border-[color:var(--gold)]/40 shadow-xl">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--primary)] text-[color:var(--gold)]">
              <Coffee className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold text-[color:var(--primary)]">L'Chef Cafe</h1>
            <p className="text-xs text-muted-foreground">Sistema de gestao - ERP & PDV</p>
          </div>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
            <Button className="w-full bg-[color:var(--primary)] hover:bg-[color:var(--primary)]/90">
              Entrar
            </Button>
          </form>
          <div className="mt-4 rounded-md bg-muted p-3 text-[11px] text-muted-foreground">
            Perfis de teste: {state.users.map((user) => user.email).join(", ")}. Use qualquer senha
            nao vazia.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
