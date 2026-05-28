import { appDataRepository } from "./app-data.repository";

export const accountantRepository = {
  async exportRows() {
    const state = await appDataRepository.getSnapshot();
    return [
      ...state.orders.map((order) => ({
        tipo: "venda",
        data: order.createdAt.slice(0, 10),
        descricao: order.id,
        valor: order.total,
        status: order.status,
      })),
      ...state.financialRecords.map((record) => ({
        tipo: record.type,
        data: record.competenceDate,
        descricao: record.description,
        valor: record.amount,
        status: record.status,
      })),
    ];
  },
};
