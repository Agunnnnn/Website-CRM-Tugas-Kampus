import { request } from "./apiClient";

export const createOrder = async (orderPayload) => {
  const res = await request("/orders", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });
  return res.data;
};

export const getOrders = async (outletId = "all") => {
  const res = await request(`/orders?outletId=${outletId}`);
  return res.data || [];
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await request(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
};

