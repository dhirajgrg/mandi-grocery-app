import API from "./axios";

export const authAPI = {
  signup: (data) => API.post("/api/v1/auth/signup", data),
  login: (data) => API.post("/api/v1/auth/login", data),
  logout: () => API.post("/api/v1/auth/logout"),
  changePassword: (data) => API.post("/api/v1/auth/changePassword", data),
  forgetPassword: (data) => API.post("/api/v1/auth/forgetPassword", data),
  resetPassword: (data) =>
    API.post(`/api/v1/auth/resetPassword/${data.token}`, data),
  verifyEmail: (data) =>
    API.post(`/api/v1/auth/verifyEmail/${data.token}`, data),
  resendVerificationEmail: (data) =>
    API.post("/api/v1/auth/resendVerificationEmail", data),
  getAllUsers: () => API.get("/api/v1/auth/users"),
  deleteUser: (id) => API.delete(`/api/v1/auth/users/${id}`),
  updateUser: (id, data) => API.patch(`/api/v1/auth/users/${id}`, data),
  uploadProfilePic: (formData) =>
    API.post("/api/v1/auth/profile-pic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
