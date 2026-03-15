import API from "./axios";

export const orderAPI = {
  // Customer
  place: (data) => API.post("/api/v1/orders", data),
  getMyOrders: () => API.get("/api/v1/orders"),
  getById: (id) => API.get(`/api/v1/orders/${id}`),
  cancel: (id) => API.patch(`/api/v1/orders/${id}/cancel`),

  // Admin
  getAll: (status) =>
    API.get("/api/v1/orders/admin/all", { params: status ? { status } : {} }),
  updateStatus: (id, status) =>
    API.patch(`/api/v1/orders/admin/${id}/status`, { status }),
  getStats: () => API.get("/api/v1/orders/admin/stats"),

  // eSewa Payment
  initiateEsewa: (data) => API.post("/api/v1/payment/esewa/initiate", data),
  verifyEsewa: (encodedData) =>
    API.post("/api/v1/payment/esewa/verify", { encodedData }),
};
