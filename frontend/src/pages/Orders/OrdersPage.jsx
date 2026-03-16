import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { orderAPI } from "../../api/orderAPI";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import OptimizedImage from "../../components/ui/OptimizedImage";

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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { onEvent } = useSocket();
  const { user } = useAuth();

  const isEmailVerified = user?.emailVerified !== false;

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
    return onEvent("order_status_changed", (data) => {
      const statusLabel = STATUS_CONFIG[data.status]?.label || data.status;
      toast(`Order #${data.orderNumber} is now ${statusLabel}`, {
        icon: "🔔",
        style: { borderLeft: "4px solid #16a34a" },
        duration: 5000,
      });
      fetchOrders();
    });
  }, [onEvent]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await orderAPI.cancel(orderId);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleDelete = async (orderId) => {
    if (
      !window.confirm("Are you sure you want to delete this cancelled order?")
    )
      return;
    try {
      await orderAPI.deleteOrder(orderId);
      toast.success("Order deleted");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  if (!isEmailVerified) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ClipboardList size={64} className="mx-auto text-text-muted/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Email Not Verified</h2>
        <p className="text-text-muted mb-6">
          Please verify your email to view and place orders.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          Go to Home <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

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

                    {/* Cancel button */}
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    {/* Delete button for cancelled orders */}
                    {order.status === "cancelled" && (
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        Delete Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
