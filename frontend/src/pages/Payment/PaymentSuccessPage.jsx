import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { orderAPI } from "../../api/orderAPI";
import { CheckCircle, ArrowRight, ClipboardList, Loader2 } from "lucide-react";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const data = searchParams.get("data");
      if (!data) {
        setError("No payment data received");
        setVerifying(false);
        return;
      }

      try {
        const res = await orderAPI.verifyEsewa(data);
        setOrder(res.data.data?.order || null);
      } catch (err) {
        setError(err.response?.data?.message || "Payment verification failed");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Loader2 size={48} className="mx-auto text-primary mb-4 animate-spin" />
        <h2 className="text-xl font-bold mb-2">Verifying Payment...</h2>
        <p className="text-sm text-text-muted">
          Please wait while we confirm your payment with eSewa.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="text-xl font-bold mb-2 text-red-600">
          Verification Failed
        </h2>
        <p className="text-sm text-text-muted mb-6">{error}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          <ClipboardList size={16} /> View Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-text-muted mb-2">
        Your payment has been verified and your order is confirmed.
      </p>

      {order && (
        <div className="mt-6 p-4 rounded-2xl bg-white border border-border text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-text-muted">Order ID</span>
            <span className="text-sm font-mono font-semibold">
              #{order._id?.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-text-muted">Amount Paid</span>
            <span className="text-sm font-bold text-green-600">
              Rs. {Math.round(order.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-text-muted">Payment Method</span>
            <span className="text-sm font-medium">eSewa</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">Items</span>
            <span className="text-sm font-medium">
              {order.items?.length || 0} product
              {order.items?.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/orders"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          <ClipboardList size={16} /> View Orders
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-light text-text text-sm font-medium rounded-xl hover:bg-gray-200 transition-all"
        >
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
