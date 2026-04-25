import API from "./axios";

export const authAPI = {
  sendSignupOtp: (data) => API.post("/api/v1/auth/send-signup-otp", data),
  signup: (data) => API.post("/api/v1/auth/signup", data),
  login: (data) => API.post("/api/v1/auth/login", data),
  logout: () => API.post("/api/v1/auth/logout"),
  changePassword: (data) => API.post("/api/v1/auth/changePassword", data),
  sendChangePasswordOtp: () =>
    API.post("/api/v1/auth/send-change-password-otp"),
  getMe: () => API.get("/api/v1/auth/me"),
  getAllUsers: () => API.get("/api/v1/auth/users"),
  deleteUser: (id) => API.delete(`/api/v1/auth/users/${id}`),
  updateUser: (id, data) => API.patch(`/api/v1/auth/users/${id}`, data),
  uploadProfilePic: (formData) =>
    API.post("/api/v1/auth/profile-pic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateName: (data) => API.patch("/api/v1/auth/update-name", data),
  updateProfile: (data) => API.patch("/api/v1/auth/update-profile", data),
  getAdminContact: () => API.get("/api/v1/auth/admin-contact"),
  forgotPassword: (data) => API.post("/api/v1/auth/forgot-password", data),
  verifyOtp: (data) => API.post("/api/v1/auth/verify-otp", data),
  resetPassword: (data) => API.post("/api/v1/auth/reset-password", data),
  sendVerificationOtp: () => API.post("/api/v1/auth/send-verification-otp"),
  verifyMobile: (data) => API.post("/api/v1/auth/verify-mobile", data),
};
