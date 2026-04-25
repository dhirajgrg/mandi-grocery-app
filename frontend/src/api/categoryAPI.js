import API from "./axios";

export const categoryAPI = {
  getAll: () => API.get("/api/v1/categories"),
  create: (name) => API.post("/api/v1/categories", { name }),
  delete: (id) => API.delete(`/api/v1/categories/${id}`),
};
