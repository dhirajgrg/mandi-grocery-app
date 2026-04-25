import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/authAPI";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserPlus, Phone, ArrowLeft } from "lucide-react";

const SignupPage = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: form, 2: OTP
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    passwordConfirm: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [remainingResends, setRemainingResends] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authAPI.sendSignupOtp(form);
      const remaining = res.data?.data?.remainingResends;
      if (remaining !== undefined) setRemainingResends(remaining);
      toast.success("OTP sent to your mobile number!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP & Create Account
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    try {
      const userData = await signup({ mobile: form.mobile, otp });
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
          <h1 className="text-3xl font-bold mb-2">
            {step === 1 ? "Create account" : "Verify your number"}
          </h1>
          <p className="text-text-muted">
            {step === 1
              ? "Join Mandi for fresh grocery delivery"
              : `Enter the 6-digit code sent to +977 ${form.mobile}`}
          </p>
        </div>

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <form
            onSubmit={handleSendOtp}
            className="space-y-5 p-6 sm:p-8 rounded-2xl bg-white border border-border"
          >
            <div>
              <label className="block text-sm font-medium mb-2 text-text-muted">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text-muted">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 py-3 rounded-l-xl bg-gray-100 border border-r-0 border-border text-sm font-medium text-text-muted">
                  +977
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
                Confirm Password
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
              disabled={sendingOtp}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingOtp ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Phone size={18} />
                  Send OTP & Verify
                </>
              )}
            </button>

            <p className="text-center text-sm text-text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border">
            <form onSubmit={handleVerifyAndSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-muted">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text text-center tracking-[0.5em] text-lg font-mono placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <p className="text-xs text-text-muted mt-2">
                  Check your backend console for the OTP (mock SMS)
                </p>
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
                    <UserPlus size={18} />
                    Verify & Create Account
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={async () => {
                    setSendingOtp(true);
                    try {
                      const res = await authAPI.sendSignupOtp(form);
                      const remaining = res.data?.data?.remainingResends;
                      if (remaining !== undefined)
                        setRemainingResends(remaining);
                      toast.success("New OTP sent!");
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message || "Failed to resend OTP",
                      );
                    } finally {
                      setSendingOtp(false);
                    }
                  }}
                  disabled={sendingOtp || remainingResends === 0}
                  className="text-primary hover:underline font-medium transition-colors disabled:opacity-50"
                >
                  {sendingOtp
                    ? "Sending..."
                    : remainingResends !== null
                      ? `Resend OTP (${remainingResends} left)`
                      : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtp("");
                    setStep(1);
                  }}
                  className="inline-flex items-center gap-1 text-text-muted hover:text-text transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
