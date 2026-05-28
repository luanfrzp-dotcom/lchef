import { appDataRepository } from "./app-data.repository";

export const productsRepository = {
  async list() {
    return (await appDataRepository.getSnapshot()).products;
  },
  async listRecipes() {
    return (await appDataRepository.getSnapshot()).recipes;
  },
};
