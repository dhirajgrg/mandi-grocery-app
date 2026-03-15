import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/authAPI";
import toast from "react-hot-toast";
import { KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    token: token || "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(form);
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white mb-4">
            <KeyRound size={28} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-text-muted">Enter your new password</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6 sm:p-8 rounded-2xl bg-white border border-border"
        >
          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
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

          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted">
              Confirm New Password
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
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
                <KeyRound size={18} />
                Reset Password
              </>
            )}
          </button>

          <p className="text-center text-sm text-text-muted">
            <Link
              to="/login"
              className="text-primary hover:underline font-medium transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
