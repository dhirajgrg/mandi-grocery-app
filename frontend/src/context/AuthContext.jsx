import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/authAPI";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Auto-restore session from cookie on app load (for remember me)
  useEffect(() => {
    const restoreSession = async () => {
      if (user || !localStorage.getItem("rememberMe")) return;
      try {
        const res = await authAPI.getMe();
        const userData = res.data.data?.user;
        if (userData) setUser(userData);
      } catch {
        localStorage.removeItem("rememberMe");
      }
    };
    restoreSession();
  }, []);

  const signup = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.signup(data);
      const { data: userData } = res.data;
      setUser(userData);
      toast.success("Account created successfully!");
      return userData;
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      const { data: userData } = res.data;
      setUser(userData);
      toast.success("Welcome back!");
      return userData;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      toast.success("Logged out successfully");
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    signup,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
