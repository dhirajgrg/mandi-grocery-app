import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/authAPI";
import toast from "react-hot-toast";
import { Phone, ShieldCheck } from "lucide-react";

const VerifyPhonePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyMobile({ otp });
      const updatedUser = res.data.data?.user || res.data.data;
      if (updatedUser) setUser(updatedUser);
      toast.success("Phone number verified!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.sendVerificationOtp();
      toast.success("New OTP sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Verify Your Phone</h1>
          <p className="text-text-muted">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-text">
              +977 {user?.mobile || "your phone"}
            </span>
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border">
          <form onSubmit={handleVerify} className="space-y-5">
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
                  <Phone size={18} />
                  Verify
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-primary hover:underline font-medium transition-colors disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="text-text-muted hover:text-text transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhonePage;
