import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brl } from "@/components/ui-bits";
import { PAYMENT_LABELS, type PaymentMethod, type Product } from "@/lib/domain";
import { useBusiness, useOpenCashRegister } from "@/lib/store";
import {
  Banknote,
  Coffee,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  ReceiptText,
  ShoppingBag,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/_app/pdv")({
  head: () => ({ meta: [{ title: "PDV - L'Chef Cafe" }] }),
  component: PDV,
});

type Item = { product: Product; quantity: number };

const channels = ["Balcao", "Mesa", "Delivery", "Retirada", "Encomenda"];
const paymentMethods: PaymentMethod[] = [
  "cash",
  "pix",
  "credit_card",
  "debit_card",
  "voucher",
  "courtesy",
];

function PDV() {
  const { state, openCash, createSale } = useBusiness();
  const openRegister = useOpenCashRegister();
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Item[]>([]);
  const [channel, setChannel] = useState("Balcao");
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [openingAmount, setOpeningAmount] = useState(200);
  const [message, setMessage] = useState("");
  const [lastReceipt, setLastReceipt] = useState<string>("");

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(state.products.map((product) => product.category)))],
    [state.products],
  );

  const list = useMemo(
    () =>
      state.products.filter(
        (product) =>
          product.status === "active" &&
          (category === "Todos" || product.category === category) &&
          (query === "" || product.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [category, query, state.products],
  );

  const add = (product: Product) =>
    setCart((current) => {
      const item = current.find((candidate) => candidate.product.id === product.id);
      return item
        ? current.map((candidate) =>
            candidate.product.id === product.id
              ? { ...candidate, quantity: candidate.quantity + 1 }
              : candidate,
          )
        : [...current, { product, quantity: 1 }];
    });

  const dec = (id: string) =>
    setCart((current) =>
      current.flatMap((item) =>
        item.product.id === id
          ? item.quantity > 1
            ? [{ ...item, quantity: item.quantity - 1 }]
            : []
          : [item],
      ),
    );
  const rm = (id: string) => setCart((current) => current.filter((item) => item.product.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discount + serviceFee);

  async function handleOpenCash() {
    try {
      await openCash(openingAmount);
      setMessage("Caixa aberto com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel abrir o caixa.");
    }
  }

  async function finishSale() {
    try {
      await createSale({
        customerName,
        channel,
        discount,
        serviceFee,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        payments: [{ method: paymentMethod, amount: total }],
      });
      const receipt = [
        "L'Chef Cafe",
        `Canal: ${channel}`,
        customerName ? `Cliente: ${customerName}` : "Cliente: Balcao",
        ...cart.map(
          (item) =>
            `${item.quantity}x ${item.product.name} - ${brl(item.product.price * item.quantity)}`,
        ),
        `Subtotal: ${brl(subtotal)}`,
        `Desconto: ${brl(discount)}`,
        `Taxa: ${brl(serviceFee)}`,
        `Total: ${brl(total)}`,
        `Pagamento: ${PAYMENT_LABELS[paymentMethod]}`,
      ].join("\n");
      setLastReceipt(receipt);
      setCart([]);
      setCustomerName("");
      setDiscount(0);
      setServiceFee(0);
      setMessage(
        "Venda finalizada. Pedido, pagamento, receita, caixa e estoque foram atualizados.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao finalizar venda.");
    }
  }

  function printReceipt() {
    if (!lastReceipt) return;
    const printWindow = window.open("", "_blank", "width=420,height=640");
    if (!printWindow) return;
    printWindow.document.write(
      `<pre style="font-family: monospace; white-space: pre-wrap">${lastReceipt}</pre>`,
    );
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div className="grid min-h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[1fr_430px]">
      <div className="flex flex-col">
        {!openRegister && (
          <Card className="mb-4 border-amber-300 bg-amber-50">
            <CardContent className="flex flex-wrap items-end gap-3 p-4">
              <div>
                <Label>Fundo inicial</Label>
                <Input
                  type="number"
                  min={0}
                  value={openingAmount}
                  onChange={(event) => setOpeningAmount(Number(event.target.value))}
                />
              </div>
              <Button onClick={handleOpenCash} className="bg-[color:var(--primary)]">
                Abrir caixa
              </Button>
              <span className="text-sm text-amber-800">
                Vendas ficam bloqueadas ate a abertura do caixa.
              </span>
            </CardContent>
          </Card>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar produto..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="max-w-xs"
          />
          <div className="ml-auto flex flex-wrap gap-1">
            {channels.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={channel === item ? "default" : "outline"}
                onClick={() => setChannel(item)}
                className={channel === item ? "bg-[color:var(--primary)]" : ""}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {categories.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={category === item ? "secondary" : "ghost"}
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((product) => (
            <button
              key={product.id}
              onClick={() => add(product)}
              className="text-left"
              disabled={!openRegister}
            >
              <Card className="h-full transition hover:border-[color:var(--gold)] hover:shadow-md">
                <CardContent className="p-3">
                  <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-[color:var(--secondary)]">
                    <Coffee className="h-8 w-8 text-[color:var(--primary)]/60" />
                  </div>
                  <div className="text-sm font-medium leading-tight">{product.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{product.category}</div>
                  <div className="mt-2 font-semibold text-[color:var(--primary)]">
                    {brl(product.price)}
                  </div>
                  {product.stock < product.stockMin && (
                    <Badge className="mt-2 bg-red-100 text-red-700">estoque critico</Badge>
                  )}
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
          <Badge variant={openRegister ? "outline" : "destructive"} className="ml-auto">
            {openRegister ? "Caixa aberto" : "Sem caixa"}
          </Badge>
        </div>
        <div className="grid gap-3 border-b p-4">
          <div>
            <Label>Cliente opcional</Label>
            <Input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Balcao"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Desconto</Label>
              <Input
                type="number"
                min={0}
                value={discount}
                onChange={(event) => setDiscount(Number(event.target.value))}
              />
            </div>
            <div>
              <Label>Taxa</Label>
              <Input
                type="number"
                min={0}
                value={serviceFee}
                onChange={(event) => setServiceFee(Number(event.target.value))}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Adicione produtos do cardapio
            </div>
          ) : (
            <ul className="divide-y">
              {cart.map((item) => (
                <li key={item.product.id} className="py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {brl(item.product.price)} / un
                      </div>
                    </div>
                    <button
                      className="text-muted-foreground hover:text-red-600"
                      onClick={() => rm(item.product.id)}
                      aria-label="remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => dec(item.product.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => add(item.product)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="font-semibold">{brl(item.product.price * item.quantity)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t p-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{brl(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <span>{brl(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de servico</span>
              <span>{brl(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-[color:var(--primary)]">{brl(total)}</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentMethod(method)}
              >
                {method === "cash" && <Banknote className="mr-1 h-3 w-3" />}
                {method === "pix" && <QrCode className="mr-1 h-3 w-3" />}
                {(method === "credit_card" || method === "debit_card" || method === "voucher") && (
                  <CreditCard className="mr-1 h-3 w-3" />
                )}
                {PAYMENT_LABELS[method]}
              </Button>
            ))}
          </div>
          {message && (
            <div className="mt-3 rounded-md bg-muted p-2 text-xs text-muted-foreground">
              {message}
            </div>
          )}
          <Button
            className="mt-3 w-full bg-[color:var(--primary)] hover:bg-[color:var(--primary)]/90"
            disabled={!cart.length || !openRegister}
            onClick={finishSale}
          >
            Finalizar venda - {brl(total)}
          </Button>
          <Button
            className="mt-2 w-full"
            variant="outline"
            disabled={!lastReceipt}
            onClick={printReceipt}
          >
            <ReceiptText className="mr-2 h-4 w-4" /> Imprimir comprovante
          </Button>
        </div>
      </Card>
    </div>
  );
}
