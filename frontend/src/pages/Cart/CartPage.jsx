import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { orderAPI } from "../../api/orderAPI";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Package,
  CreditCard,
  Truck,
  Store,
} from "lucide-react";
import LocationPicker from "../../components/ui/LocationPicker";
import OptimizedImage from "../../components/ui/OptimizedImage";

const CartPage = () => {
  const {
    cartItems,
    cartTotal,
    loading,
    updateCartItem,
    removeFromCart,
    fetchCart,
  } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderType, setOrderType] = useState("delivery");

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-text-muted/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view your cart</h2>
        <p className="text-text-muted mb-6">
          You need to be logged in to manage your cart
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          Sign In <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (isAuthenticated && user?.emailVerified === false) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-text-muted/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Email Not Verified</h2>
        <p className="text-text-muted mb-6">
          Please verify your email to access your cart and place orders.
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

  if (loading) return <LoadingSpinner text="Loading cart..." />;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-text-muted/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-text-muted mb-6">
          Start shopping to add items to your cart
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          Browse Products <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-1">Shopping Cart</h1>
      <p className="text-sm text-text-muted mb-6">
        {cartItems.length} item{cartItems.length > 1 ? "s" : ""} in your cart
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => {
            const product = item.productId;
            return (
              <div
                key={item._id}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-border hover:border-gray-300 transition-all"
              >
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-surface-light overflow-hidden shrink-0">
                  {product?.images?.[0] ? (
                    <OptimizedImage
                      src={product.images[0]}
                      alt={product?.name}
                      width={200}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package size={24} className="text-text-muted/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {product?.name || "Product"}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {product?.category} · {product?.unit}
                  </p>
                  <div className="mt-2">
                    {item.discount > 0 && (
                      <p className="text-xs text-text-muted line-through">
                        Rs. {item.price}/{product?.unit}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-xs text-text-muted">
                        Rs.{" "}
                        {Math.round(
                          item.price * (1 - (item.discount || 0) / 100),
                        )}
                        /{product?.unit} &times; {item.quantity} =
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        Rs.{" "}
                        {Math.round(
                          item.price *
                            (1 - (item.discount || 0) / 100) *
                            item.quantity,
                        )}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          -{item.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(product?._id)}
                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-center gap-2 bg-surface-light rounded-full px-1">
                    <button
                      onClick={() =>
                        item.quantity <= 1
                          ? removeFromCart(product?._id)
                          : updateCartItem(product?._id, item.quantity - 1)
                      }
                      className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartItem(product?._id, item.quantity + 1)
                      }
                      className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 rounded-2xl bg-white border border-border">
            <h2 className="text-lg font-bold mb-4">Cart Summary</h2>

            <div className="space-y-3 mb-6">
              {/* Item-level breakdown */}
              <div className="space-y-2">
                {cartItems.map((item) => {
                  const unitPrice = Math.round(
                    item.price * (1 - (item.discount || 0) / 100),
                  );
                  return (
                    <div
                      key={item._id}
                      className="flex justify-between text-xs text-text-muted"
                    >
                      <span className="truncate mr-2">
                        {item.productId?.name} ({item.quantity} &times; Rs.{" "}
                        {unitPrice}/{item.productId?.unit})
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        Rs. {unitPrice * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">
                    Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)}{" "}
                    items)
                  </span>
                  <span className="font-medium">
                    Rs. {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    Rs. {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              disabled={showCheckout}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all mb-3 disabled:opacity-50"
            >
              <CreditCard size={18} />
              Proceed to Checkout
            </button>

            {showCheckout && (
              <div className="border-t border-border pt-4 mt-4 space-y-3">
                {/* Order Type Selector */}
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-2">
                    Order Type
                  </label>
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                        orderType === "delivery"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderType"
                        value="delivery"
                        checked={orderType === "delivery"}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="accent-primary"
                      />
                      <Truck size={16} className="text-text-muted" />
                      <span className="text-sm font-medium">Delivery</span>
                    </label>
                    <label
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                        orderType === "takeaway"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderType"
                        value="takeaway"
                        checked={orderType === "takeaway"}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="accent-primary"
                      />
                      <Store size={16} className="text-text-muted" />
                      <span className="text-sm font-medium">Takeaway</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Location (only for delivery) */}
                {orderType === "delivery" ? (
                  <>
                    <h3 className="font-semibold text-sm">Delivery Location</h3>
                    <LocationPicker
                      onLocationChange={({
                        lat: newLat,
                        lng: newLng,
                        address: newAddr,
                      }) => {
                        setLat(newLat);
                        setLng(newLng);
                        setAddress(newAddr);
                      }}
                      initialAddress={address}
                    />
                  </>
                ) : (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <div className="flex items-start gap-3">
                      <Store
                        size={18}
                        className="text-amber-600 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Store Pickup
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Your order will be prepared and ready for pickup at
                          our store. You&apos;ll receive a notification when
                          it&apos;s ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-2">
                    Payment Method
                  </label>
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">
                        Cash on Delivery
                      </span>
                    </label>
                    <label
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === "esewa"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="esewa"
                        checked={paymentMethod === "esewa"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">eSewa</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (orderType === "delivery" && !address.trim()) {
                      toast.error("Please enter a delivery address");
                      return;
                    }
                    setPlacing(true);
                    try {
                      if (paymentMethod === "esewa") {
                        const res = await orderAPI.initiateEsewa({
                          address:
                            orderType === "takeaway"
                              ? "Takeaway - Store Pickup"
                              : address.trim(),
                          lat: orderType === "takeaway" ? 0 : lat,
                          lng: orderType === "takeaway" ? 0 : lng,
                          orderType,
                        });
                        const { esewaFormData, esewaPaymentUrl } =
                          res.data.data;

                        const form = document.createElement("form");
                        form.method = "POST";
                        form.action = esewaPaymentUrl;

                        for (const [key, value] of Object.entries(
                          esewaFormData,
                        )) {
                          const input = document.createElement("input");
                          input.type = "hidden";
                          input.name = key;
                          input.value = String(value);
                          form.appendChild(input);
                        }

                        document.body.appendChild(form);
                        form.submit();
                        return;
                      }

                      // COD flow
                      await orderAPI.place({
                        address:
                          orderType === "takeaway"
                            ? "Takeaway - Store Pickup"
                            : address.trim(),
                        lat: orderType === "takeaway" ? 0 : lat,
                        lng: orderType === "takeaway" ? 0 : lng,
                        paymentMethod: "cod",
                        orderType,
                      });
                      toast.success(
                        orderType === "takeaway"
                          ? "Order placed! Ready for pickup soon."
                          : "Order placed successfully!",
                      );
                      await fetchCart();
                      navigate("/orders");
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message || "Failed to place order",
                      );
                    } finally {
                      setPlacing(false);
                    }
                  }}
                  disabled={placing}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {placing
                    ? "Processing..."
                    : paymentMethod === "esewa"
                      ? "Pay with eSewa"
                      : "Place Order"}
                </button>
              </div>
            )}

            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-surface-light text-text font-medium rounded-xl hover:bg-gray-200 transition-all text-sm"
            >
              Continue Shopping
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
