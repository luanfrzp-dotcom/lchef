import { appDataRepository } from "./app-data.repository";

export const customersRepository = {
  async list() {
    return (await appDataRepository.getSnapshot()).customers;
  },
};
