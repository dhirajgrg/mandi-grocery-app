import { Link } from "react-router-dom";
import { XCircle, ArrowRight, ShoppingCart } from "lucide-react";

const PaymentFailurePage = () => {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <XCircle size={40} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
      <p className="text-text-muted mb-2">
        Your payment could not be completed. No amount has been charged.
      </p>
      <p className="text-sm text-text-muted mb-8">
        This could happen due to insufficient balance, a cancelled transaction,
        or a network issue. Please try again.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/cart"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          <ShoppingCart size={16} /> Back to Cart
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

export default PaymentFailurePage;
