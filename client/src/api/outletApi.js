import { request } from "./apiClient";

export const getOutlets = async () => {
  const res = await request("/outlets");
  return res.data || [];
};

