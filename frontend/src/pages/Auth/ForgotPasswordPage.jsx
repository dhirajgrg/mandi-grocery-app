import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/authAPI";
import toast from "react-hot-toast";
import { Phone, ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: mobile, 2: otp, 3: new password
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainingResends, setRemainingResends] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ mobile });
      const remaining = res.data?.data?.remainingResends;
      if (remaining !== undefined) setRemainingResends(remaining);
      toast.success("OTP sent to your mobile number");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyOtp({ mobile, otp });
      toast.success("OTP verified!");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ mobile, otp, password, passwordConfirm });
      toast.success("Password reset successfully! Please login.");
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
          <img
            src="/logo.png"
            alt="Mandi"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "New Password"}
          </h1>
          <p className="text-text-muted">
            {step === 1 && "Enter your mobile number to receive an OTP"}
            {step === 2 && "Enter the 6-digit code sent to your phone"}
            {step === 3 && "Set your new password"}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border">
          {/* Step 1: Enter Mobile */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
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
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    required
                    placeholder="98XXXXXXXX"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-r-xl bg-surface-light border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-muted">
                  Enter OTP
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
                  className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text text-center tracking-[0.5em] text-lg font-mono placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <p className="text-xs text-text-muted mt-2">
                  OTP sent to +977 {mobile}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await authAPI.forgotPassword({ mobile });
                      const remaining = res.data?.data?.remainingResends;
                      if (remaining !== undefined)
                        setRemainingResends(remaining);
                      toast.success("New OTP sent!");
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message || "Failed to resend OTP",
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || remainingResends === 0}
                  className="text-primary hover:underline font-medium transition-colors disabled:opacity-50"
                >
                  {loading
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
                  className="text-text-muted hover:text-text transition-colors"
                >
                  Change mobile number
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-muted">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50"
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
            </form>
          )}

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
