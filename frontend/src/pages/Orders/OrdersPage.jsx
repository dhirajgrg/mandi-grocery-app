import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Store,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { orderAPI } from "../../api/orderAPI";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import OptimizedImage from "../../components/ui/OptimizedImage";
import ConfirmModal from "../../components/ui/ConfirmModal";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-blue-600 bg-blue-50",
  },
  packed: {
    label: "Packed",
    icon: Package,
    color: "text-indigo-600 bg-indigo-50",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: Truck,
    color: "text-orange-600 bg-orange-50",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50",
  },
};

const STATUS_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "packed", label: "Packed", icon: Package },
  { key: "out_for_delivery", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const OrderStatusTracker = ({ status }) => {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="border-t border-border pt-3">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center flex-1 relative"
            >
              {idx > 0 && (
                <div
                  className={`absolute top-3.5 right-1/2 w-full h-0.5 -z-10 ${
                    idx <= currentIdx ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? "bg-primary text-white ring-2 ring-primary/30"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                <StepIcon size={14} />
              </div>
              <span
                className={`text-[9px] mt-1 font-medium text-center ${
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                      ? "text-green-600"
                      : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const { onEvent } = useSocket();
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getMyOrders();
      setOrders(res.data.data?.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen for real-time order status changes
  useEffect(() => {
    return onEvent("order_status_changed", () => {
      fetchOrders();
    });
  }, [onEvent]);

  const handleCancel = (orderId) => {
    setConfirmModal({
      open: true,
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order?",
      onConfirm: async () => {
        try {
          await orderAPI.cancel(orderId);
          toast.success("Order cancelled");
          fetchOrders();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to cancel order",
          );
        }
      },
    });
  };

  const handleDelete = (orderId) => {
    setConfirmModal({
      open: true,
      title: "Delete Order",
      message: "Are you sure you want to delete this cancelled order?",
      onConfirm: async () => {
        try {
          await orderAPI.deleteOrder(orderId);
          toast.success("Order deleted");
          fetchOrders();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to delete order",
          );
        }
      },
    });
  };

  const handleReorder = async (orderId) => {
    try {
      const res = await orderAPI.reorder(orderId);
      toast.success(res.data.message || "Items added to cart");
      await fetchCart();
      navigate("/cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reorder");
    }
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <ClipboardList
            size={48}
            className="mx-auto text-text-muted/30 mb-4"
          />
          <h2 className="text-lg font-bold mb-1">No orders yet</h2>
          <p className="text-sm text-text-muted mb-6">
            When you place an order, it will appear here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-border overflow-hidden"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${config.color}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        Rs.{Math.round(order.totalAmount)}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-text-muted" />
                    ) : (
                      <ChevronDown size={16} className="text-text-muted" />
                    )}
                  </div>
                </button>

                {/* Order Details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 space-y-3">
                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => {
                        const product = item.productId;
                        const discountedPrice = Math.round(
                          item.price * (1 - (item.discount || 0) / 100),
                        );
                        const lineTotal = discountedPrice * item.quantity;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {product?.images?.[0] && (
                                <OptimizedImage
                                  src={product.images[0]}
                                  alt={product?.name}
                                  width={80}
                                  className="w-8 h-8 rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium">
                                  {product?.name || "Unknown Product"}
                                </p>
                                {item.discount > 0 && (
                                  <p className="text-xs text-text-muted line-through">
                                    Rs. {item.price}/{product?.unit}
                                  </p>
                                )}
                                <p className="text-xs text-text-muted">
                                  Rs. {discountedPrice}/{product?.unit} &times;{" "}
                                  {item.quantity}
                                  {item.discount > 0 && (
                                    <span className="ml-2 text-green-600">
                                      -{item.discount}% off
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">Rs.{lineTotal}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Status Progress Tracker */}
                    {order.status !== "cancelled" && (
                      <OrderStatusTracker status={order.status} />
                    )}

                    {/* Delivery / Takeaway Info */}
                    {order.orderType === "takeaway" ? (
                      <div className="text-xs text-text-muted border-t border-border pt-2 flex items-center gap-1.5">
                        <Store size={12} className="text-amber-600" />
                        <span className="font-medium text-amber-700">
                          Takeaway - Store Pickup
                        </span>
                      </div>
                    ) : order.deliveryLocation?.address ? (
                      <div className="text-xs text-text-muted border-t border-border pt-2">
                        <span className="font-medium text-text">Delivery:</span>{" "}
                        {order.deliveryLocation.address}
                      </div>
                    ) : null}

                    {/* Payment Info */}
                    <div className="text-xs text-text-muted flex items-center gap-3">
                      <span>
                        <span className="font-medium text-text">Payment:</span>{" "}
                        {order.paymentMethod === "esewa" ? "eSewa" : "COD"}
                      </span>
                      {order.paymentMethod === "esewa" && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.paymentStatus === "paid"
                              ? "bg-green-50 text-green-600"
                              : "bg-yellow-50 text-yellow-600"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      {/* Cancel — only for pending orders */}
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <XCircle size={15} />
                          Cancel Order
                        </button>
                      )}

                      {/* Reorder — for delivered or cancelled orders */}
                      {(order.status === "delivered" ||
                        order.status === "cancelled") && (
                        <button
                          onClick={() => handleReorder(order._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors"
                        >
                          <RotateCcw size={15} />
                          Reorder
                        </button>
                      )}

                      {/* Delete — only for cancelled orders */}
                      {order.status === "cancelled" && (
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={confirmModal.open}
        onClose={() =>
          setConfirmModal({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Yes"
        cancelText="No"
      />
    </div>
  );
};

export default OrdersPage;
