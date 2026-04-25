import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, LogIn, Phone } from "lucide-react";

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login({ ...form, rememberMe });
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      navigate(userData?.role === "admin" ? "/admin" : "/");
    } catch {
      // error handled in context
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Mandi"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-text-muted">Sign in to your Mandi account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6 sm:p-8 rounded-2xl bg-white border border-border"
        >
          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted">
              Mobile Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center gap-1 px-4 py-3 rounded-l-xl bg-gray-100 border border-r-0 border-border text-sm font-medium text-text-muted">
                <Phone size={14} /> +977
              </span>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm({ ...form, mobile: val });
                }}
                required
                placeholder="98XXXXXXXX"
                maxLength={10}
                className="w-full px-4 py-3 rounded-r-xl bg-surface-light border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border bg-surface-light text-primary focus:ring-primary/30"
              />
              <span className="text-text-muted">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>

          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
