import { request } from "./apiClient";

export const adminLogin = async (loginInput, password) => {
  const res = await request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ loginInput, password }),
  });
  return res.data;
};

