import API from "./axios";

export const settingsAPI = {
  getShopStatus: () => API.get("/api/v1/settings/shop-status"),
  toggleShopStatus: () => API.patch("/api/v1/settings/shop-status"),
};
