import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRODUTOS, CATEGORIAS_PRODUTO, type Produto } from "@/lib/mock-data";
import { brl } from "@/components/ui-bits";
import { Plus, Minus, Trash2, ShoppingBag, Banknote, CreditCard, QrCode, Coffee } from "lucide-react";

export const Route = createFileRoute("/_app/pdv")({
  head: () => ({ meta: [{ title: "PDV · L'Chef Café" }] }),
  component: PDV,
});

type Item = { p: Produto; q: number };

function PDV() {
  const [cat, setCat] = useState<string>("Todos");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Item[]>([]);
  const [tipo, setTipo] = useState("Balcão");

  const list = useMemo(
    () => PRODUTOS.filter(p =>
      (cat === "Todos" || p.categoria === cat) &&
      (q === "" || p.nome.toLowerCase().includes(q.toLowerCase()))),
    [cat, q]
  );

  const add = (p: Produto) =>
    setCart(c => {
      const f = c.find(i => i.p.id === p.id);
      return f ? c.map(i => i.p.id === p.id ? { ...i, q: i.q + 1 } : i) : [...c, { p, q: 1 }];
    });
  const dec = (id: string) => setCart(c => c.flatMap(i => i.p.id === id ? (i.q > 1 ? [{ ...i, q: i.q - 1 }] : []) : [i]));
  const rm = (id: string) => setCart(c => c.filter(i => i.p.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.p.preco * i.q, 0);
  const taxa = +(subtotal * 0.0).toFixed(2);
  const total = subtotal + taxa;

  return (
    <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[1fr_420px]">
      <div className="flex flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input placeholder="Buscar produto..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <div className="ml-auto flex gap-1">
            {(["Balcão", "Mesa", "Delivery", "Retirada", "Encomenda"] as const).map(t => (
              <Button key={t} size="sm" variant={tipo === t ? "default" : "outline"}
                onClick={() => setTipo(t)}
                className={tipo === t ? "bg-[color:var(--primary)]" : ""}>{t}</Button>
            ))}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {["Todos", ...CATEGORIAS_PRODUTO.slice(0, 10)].map(c => (
            <Button key={c} size="sm" variant={cat === c ? "secondary" : "ghost"} onClick={() => setCat(c)}>
              {c}
            </Button>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
          {list.map(p => (
            <button key={p.id} onClick={() => add(p)} className="text-left">
              <Card className="h-full transition hover:border-[color:var(--gold)] hover:shadow-md">
                <CardContent className="p-3">
                  <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-[color:var(--secondary)]">
                    <Coffee className="h-8 w-8 text-[color:var(--primary)]/60" />
                  </div>
                  <div className="text-sm font-medium leading-tight">{p.nome}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{p.categoria}</div>
                  <div className="mt-2 font-semibold text-[color:var(--primary)]">{brl(p.preco)}</div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <Card className="flex flex-col">
        <div className="flex items-center gap-2 border-b p-4">
          <ShoppingBag className="h-4 w-4 text-[color:var(--gold)]" />
          <span className="font-semibold">Comanda</span>
          <Badge variant="outline" className="ml-auto">{tipo}</Badge>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">Adicione produtos do cardápio</div>
          ) : (
            <ul className="divide-y">
              {cart.map(i => (
                <li key={i.p.id} className="py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{i.p.nome}</div>
                      <div className="text-xs text-muted-foreground">{brl(i.p.preco)} · un</div>
                    </div>
                    <button className="text-muted-foreground hover:text-red-600" onClick={() => rm(i.p.id)} aria-label="remover"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => dec(i.p.id)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-7 text-center text-sm">{i.q}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => add(i.p)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <div className="font-semibold">{brl(i.p.preco * i.q)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t p-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{brl(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taxa de serviço</span><span>{brl(taxa)}</span></div>
            <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-[color:var(--primary)]">{brl(total)}</span></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm"><Banknote className="mr-1 h-3 w-3" /> Dinheiro</Button>
            <Button variant="outline" size="sm"><QrCode className="mr-1 h-3 w-3" /> PIX</Button>
            <Button variant="outline" size="sm"><CreditCard className="mr-1 h-3 w-3" /> Cartão</Button>
          </div>
          <Button className="mt-3 w-full bg-[color:var(--primary)] hover:bg-[color:var(--primary)]/90" disabled={!cart.length}>
            Finalizar Venda · {brl(total)}
          </Button>
        </div>
      </Card>
    </div>
  );
}
