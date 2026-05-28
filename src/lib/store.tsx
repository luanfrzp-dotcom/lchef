import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { INITIAL_STATE } from "./initial-data";
import {
  canAccessRoute,
  dashboardMetrics,
  getOpenCashRegister,
  hasPermission,
  type AppState,
  type InventoryMovement,
  type OrderStatus,
  type Permission,
  type SaleInput,
  type User,
} from "./domain";
import { appDataRepository } from "@/repositories/app-data.repository";
import { authRepository } from "@/repositories/auth.repository";
import { salesRepository } from "@/repositories/sales.repository";
import { cashRegisterService } from "@/services/cash-register.service";
import { financialService } from "@/services/financial.service";
import { inventoryService } from "@/services/inventory.service";
import { purchaseService } from "@/services/purchase.service";
import { salesService } from "@/services/sales.service";
import { isSupabaseConfigured } from "./supabase/client";

const DEFAULT_UNIT_ID = "00000000-0000-4000-8000-000000000001";
const APP_STATE_QUERY_KEY = ["app-state"] as const;

type BusinessContextValue = {
  state: AppState;
  hydrated: boolean;
  loading: boolean;
  error?: string;
  currentUser?: User;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetDemo: () => Promise<void>;
  canAccess: (pathname: string) => boolean;
  has: (permission: Permission) => boolean;
  openCash: (amount: number) => Promise<void>;
  closeCash: (amount: number) => Promise<void>;
  supplyCash: (amount: number, note: string) => Promise<void>;
  withdrawCash: (amount: number, note: string) => Promise<void>;
  createSale: (input: Omit<SaleInput, "userId">) => Promise<void>;
  cancelSale: (orderId: string, reason: string) => Promise<void>;
  changeOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  moveInventory: (movement: Omit<InventoryMovement, "id" | "createdAt">) => Promise<void>;
  markPaid: (id: string) => Promise<void>;
  receivePurchase: (id: string) => Promise<void>;
  payPurchase: (id: string) => Promise<void>;
  metrics: ReturnType<typeof dashboardMetrics>;
};

const BusinessContext = React.createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = React.useState<User | undefined>();
  const [hydrated, setHydrated] = React.useState(false);
  const [lastError, setLastError] = React.useState<string | undefined>();

  React.useEffect(() => {
    let alive = true;
    authRepository.currentUser().then((user) => {
      if (!alive) return;
      setCurrentUser(user);
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const stateQuery = useQuery({
    queryKey: [...APP_STATE_QUERY_KEY, currentUser?.id ?? "anonymous"],
    queryFn: appDataRepository.getSnapshot,
    enabled: hydrated && (!isSupabaseConfigured || Boolean(currentUser)),
    retry: 1,
  });

  const state = React.useMemo<AppState>(() => {
    const snapshot = stateQuery.data ?? INITIAL_STATE;
    return {
      ...snapshot,
      currentUserId: currentUser?.id,
    };
  }, [currentUser?.id, stateQuery.data]);

  const currentUnitId = currentUser?.unitId ?? DEFAULT_UNIT_ID;

  const invalidateBusinessData = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: APP_STATE_QUERY_KEY });
  }, [queryClient]);

  const runMutation = React.useCallback(
    async (operation: () => Promise<unknown>) => {
      setLastError(undefined);
      try {
        await operation();
        await invalidateBusinessData();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Operacao nao concluida.";
        setLastError(message);
        throw error;
      }
    },
    [invalidateBusinessData],
  );

  const mutation = useMutation({
    mutationFn: runMutation,
  });

  const value = React.useMemo<BusinessContextValue>(
    () => ({
      state,
      hydrated,
      loading: stateQuery.isLoading || mutation.isPending,
      error:
        lastError ?? (stateQuery.error instanceof Error ? stateQuery.error.message : undefined),
      currentUser,
      async login(email, password) {
        setLastError(undefined);
        const user = await authRepository.login(email, password);
        if (!user) {
          setLastError("E-mail ou senha invalidos.");
          return false;
        }
        setCurrentUser(user);
        await invalidateBusinessData();
        return true;
      },
      async logout() {
        await authRepository.logout();
        setCurrentUser(undefined);
        await invalidateBusinessData();
      },
      async resetDemo() {
        await authRepository.resetDemo();
        setCurrentUser(undefined);
        await invalidateBusinessData();
      },
      canAccess(pathname) {
        return canAccessRoute(currentUser, pathname);
      },
      has(permission) {
        return hasPermission(currentUser, permission);
      },
      openCash(amount) {
        return mutation.mutateAsync(() => cashRegisterService.open(currentUnitId, amount));
      },
      closeCash(amount) {
        const openCash = getOpenCashRegister(state);
        return mutation.mutateAsync(() =>
          cashRegisterService.close(currentUnitId, amount, openCash?.id),
        );
      },
      supplyCash(amount, note) {
        return mutation.mutateAsync(() => cashRegisterService.supply(currentUnitId, amount, note));
      },
      withdrawCash(amount, note) {
        return mutation.mutateAsync(() =>
          cashRegisterService.withdraw(currentUnitId, amount, note),
        );
      },
      createSale(input) {
        return mutation.mutateAsync(() =>
          salesService.completeSale(input, state.products, currentUnitId),
        );
      },
      cancelSale(orderId, reason) {
        return mutation.mutateAsync(() => salesService.cancelSale(orderId, reason));
      },
      changeOrderStatus(orderId, status) {
        return mutation.mutateAsync(() => salesRepository.changeOrderStatus(orderId, status));
      },
      moveInventory(movement) {
        return mutation.mutateAsync(() => inventoryService.adjust(movement));
      },
      markPaid(id) {
        const record = state.financialRecords.find((item) => item.id === id);
        if (!record) return Promise.reject(new Error("Lancamento nao encontrado."));
        return mutation.mutateAsync(() =>
          financialService.markPaid(record, currentUnitId, getOpenCashRegister(state)),
        );
      },
      receivePurchase(id) {
        return mutation.mutateAsync(() => purchaseService.receive(id));
      },
      payPurchase(id) {
        return mutation.mutateAsync(() =>
          financialService.payPurchase(id, currentUnitId, getOpenCashRegister(state)),
        );
      },
      metrics: dashboardMetrics(state),
    }),
    [
      currentUnitId,
      currentUser,
      hydrated,
      invalidateBusinessData,
      lastError,
      mutation,
      state,
      stateQuery.error,
      stateQuery.isLoading,
    ],
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const value = React.useContext(BusinessContext);
  if (!value) throw new Error("useBusiness must be used inside BusinessProvider");
  return value;
}

export function useOpenCashRegister() {
  const { state } = useBusiness();
  return getOpenCashRegister(state);
}
