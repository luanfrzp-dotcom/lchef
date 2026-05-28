import { calculateDre, cashFlowProjection, dashboardMetrics } from "@/lib/domain";
import { appDataRepository } from "./app-data.repository";

export const reportsRepository = {
  async dashboard() {
    return dashboardMetrics(await appDataRepository.getSnapshot());
  },
  async dre() {
    return calculateDre(await appDataRepository.getSnapshot());
  },
  async cashFlow() {
    return cashFlowProjection(await appDataRepository.getSnapshot());
  },
};
