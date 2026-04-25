import API from "./axios";

export const cartAPI = {
  get: () => API.get("/api/v1/cart"),
  add: (data) => API.post("/api/v1/cart/add", data),
  update: (data) => API.put("/api/v1/cart/update", data),
  remove: (data) => API.delete("/api/v1/cart/remove", { data }),
  clear: () => API.delete("/api/v1/cart/clear"),
};
