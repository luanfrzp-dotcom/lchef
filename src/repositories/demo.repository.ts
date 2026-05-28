import { INITIAL_STATE } from "@/lib/initial-data";
import {
  addCashMovement,
  addInventoryMovement,
  cancelOrder,
  closeCashRegister,
  finalizeSale,
  markFinancialRecordPaid,
  openCashRegister,
  payPurchase,
  receivePurchase,
  updateOrderStatus,
  type AppState,
  type InventoryMovement,
  type OrderStatus,
  type SaleInput,
} from "@/lib/domain";

const STATE_KEY = "lchef-operating-state-v2";
const USER_KEY = "lchef-current-user-id";

function readState(): AppState {
  if (typeof window === "undefined") return INITIAL_STATE;
  const raw = window.localStorage.getItem(STATE_KEY);
  if (!raw) return INITIAL_STATE;
  try {
    return { ...INITIAL_STATE, ...JSON.parse(raw) } as AppState;
  } catch {
    return INITIAL_STATE;
  }
}

function writeState(state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function currentUserId() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(USER_KEY) ?? undefined;
}

function requireUserId() {
  const userId = currentUserId();
  if (!userId) throw new Error("Entre no sistema para continuar.");
  return userId;
}

function mutate(fn: (state: AppState, userId: string) => AppState) {
  const next = fn(readState(), requireUserId());
  writeState(next);
  return next;
}

export const demoRepository = {
  async getState() {
    return { ...readState(), currentUserId: currentUserId() };
  },
  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const state = readState();
    const user = state.users.find((item) => item.email.toLowerCase() === normalized && item.active);
    if (!user || !password.trim()) return undefined;
    window.localStorage.setItem(USER_KEY, user.id);
    return user;
  },
  async logout() {
    window.localStorage.removeItem(USER_KEY);
  },
  async reset() {
    window.localStorage.removeItem(STATE_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
  async openCashRegister(amount: number) {
    mutate((state, userId) => openCashRegister(state, userId, amount));
  },
  async closeCashRegister(amount: number) {
    mutate((state, userId) => closeCashRegister(state, userId, amount));
  },
  async registerCashMovement(type: "supply" | "withdrawal", amount: number, note: string) {
    mutate((state, userId) => addCashMovement(state, userId, type, amount, note));
  },
  async completeSale(input: Omit<SaleInput, "userId">) {
    mutate((state, userId) => finalizeSale(state, { ...input, userId }));
  },
  async cancelSale(orderId: string, reason: string) {
    mutate((state, userId) => cancelOrder(state, userId, orderId, reason));
  },
  async changeOrderStatus(orderId: string, status: OrderStatus) {
    mutate((state, userId) => updateOrderStatus(state, userId, orderId, status));
  },
  async moveInventory(movement: Omit<InventoryMovement, "id" | "createdAt">) {
    mutate((state, userId) => addInventoryMovement(state, userId, movement));
  },
  async markPaid(id: string) {
    mutate((state, userId) => markFinancialRecordPaid(state, userId, id));
  },
  async receivePurchase(id: string) {
    mutate((state, userId) => receivePurchase(state, userId, id));
  },
  async payPurchase(id: string) {
    mutate((state, userId) => payPurchase(state, userId, id));
  },
};
