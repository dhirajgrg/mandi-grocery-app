import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/authAPI";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Send } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgetPassword({ email });
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white mb-4">
            <Mail size={28} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {sent ? "Check your email" : "Forgot password?"}
          </h1>
          <p className="text-text-muted">
            {sent
              ? "We've sent a password reset link to your email"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {!sent ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6 sm:p-8 rounded-2xl bg-white border border-border"
          >
            <div>
              <label className="block text-sm font-medium mb-2 text-text-muted">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
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
                  <Send size={18} />
                  Send Reset Link
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
        ) : (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border text-center">
            <p className="text-sm text-text-muted mb-4">
              Didn&apos;t receive the email? Check your spam folder or try
              again.
            </p>
            <button
              onClick={() => setSent(false)}
              className="px-6 py-2 bg-surface-light hover:bg-surface-lighter text-text-muted rounded-xl text-sm font-medium transition-all"
            >
              Try Again
            </button>
            <div className="mt-4">
              <Link
                to="/login"
                className="text-primary hover:underline text-sm font-medium transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
