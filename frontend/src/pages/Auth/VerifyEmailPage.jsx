import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authAPI } from "../../api/authAPI";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        await authAPI.verifyEmail({ token });
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        // Update user state so the app removes all unverified blocks
        setUser((prev) => (prev ? { ...prev, emailVerified: true } : prev));
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. The link may have expired.",
        );
      }
    };
    verify();
  }, [token, setUser]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verifying your email...</h2>
            <p className="text-text-muted text-sm">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
            <p className="text-text-muted text-sm mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-dark transition-colors"
            >
              Go to Home
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
            <p className="text-text-muted text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-dark transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
