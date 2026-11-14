import { request } from "./apiClient";

export const loginOrRegisterMember = async (payload) => {
  const res = await request("/members/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const getMemberById = async (id) => {
  const res = await request(`/members/${id}`);
  return res.data;
};

export const getMemberPointsHistory = async (id) => {
  const res = await request(`/members/${id}/points-history`);
  return res.data || [];
};

