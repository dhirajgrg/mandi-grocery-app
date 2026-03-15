import API from "./axios";

export const productAPI = {
  getAll: (params) => API.get("/api/v1/products", { params }),
  search: (params) => API.get("/api/v1/products/search", { params }),
  getById: (id) => API.get(`/api/v1/products/${id}`),
  getRecommendations: (id) => API.get(`/api/v1/products/${id}/recommendations`),
  create: (data) => API.post("/api/v1/products", data),
  update: (id, data) => API.put(`/api/v1/products/${id}`, data),
  delete: (id) => API.delete(`/api/v1/products/${id}`),
};
