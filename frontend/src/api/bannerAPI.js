import API from "./axios";

export const bannerAPI = {
  getAll: () => API.get("/api/v1/banners"),
  getAllAdmin: () => API.get("/api/v1/banners/all"),
  create: (data) => API.post("/api/v1/banners", data),
  update: (id, data) => API.put(`/api/v1/banners/${id}`, data),
  delete: (id) => API.delete(`/api/v1/banners/${id}`),
};
