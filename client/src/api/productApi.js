import { request } from "./apiClient";

export const getProducts = async () => {
  const res = await request("/products");
  return res.data || [];
};

