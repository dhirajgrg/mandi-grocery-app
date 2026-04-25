import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { orderAPI } from "../../api/orderAPI";
import { settingsAPI } from "../../api/settingsAPI";
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
  AlertTriangle,
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
  const { isAuthenticated } = useAuth();
  const { onEvent } = useSocket();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [shopOpen, setShopOpen] = useState(true);
  const [orderingOpen, setOrderingOpen] = useState(true);

  useEffect(() => {
    settingsAPI
      .getShopStatus()
      .then((res) => {
        setShopOpen(res.data.data?.isOpen ?? true);
      })
      .catch(() => {});
  }, []);

  // Check if current time is within ordering hours (7 AM - 9 PM)
  useEffect(() => {
    const checkOrderingHours = () => {
      const now = new Date();
      const h = now.getHours();
      setOrderingOpen(h >= 7 && h < 21);
    };
    checkOrderingHours();
    const interval = setInterval(checkOrderingHours, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return onEvent("shop_status_changed", (data) => {
      setShopOpen(data.isOpen);
      if (!data.isOpen && showCheckout) {
        setShowCheckout(false);
        toast.error("Shop is now closed");
      }
    });
  }, [onEvent, showCheckout]);

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(cartItems.map((i) => i.productId?._id || i.productId)),
      );
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;
    if (
      !window.confirm(
        `Remove ${selectedItems.size} selected item(s) from cart?`,
      )
    )
      return;
    try {
      for (const id of selectedItems) {
        await removeFromCart(id);
      }
      setSelectedItems(new Set());
      toast.success(`${selectedItems.size} item(s) removed`);
    } catch {
      toast.error("Failed to remove items");
    }
  };

  if (!isAuthenticated) {
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
    // Guest has items — show cart but prompt login at checkout
  }

  if (loading && isAuthenticated)
    return <LoadingSpinner text="Loading cart..." />;

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
          {/* Select All + Delete Selected */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={
                  cartItems.length > 0 &&
                  selectedItems.size === cartItems.length
                }
                onChange={toggleSelectAll}
                className="accent-primary w-4 h-4 rounded"
              />
              Select All
            </label>
            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={13} />
                Delete {selectedItems.size} selected
              </button>
            )}
          </div>

          {cartItems.map((item) => {
            const product = item.productId;
            const productId = product?._id || item.productId;
            return (
              <div
                key={item._id}
                className={`flex gap-4 p-4 rounded-2xl bg-white border transition-all ${
                  selectedItems.has(productId)
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(productId)}
                    onChange={() => toggleSelectItem(productId)}
                    className="accent-primary w-4 h-4 rounded mt-1"
                  />
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-surface-light overflow-hidden">
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

                <div className="flex flex-col items-end justify-end">
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
              onClick={() => {
                if (!isAuthenticated) {
                  toast("Please sign in to checkout", { icon: "🔒" });
                  navigate("/login");
                  return;
                }
                if (!shopOpen) {
                  toast.error(
                    "Shop is currently closed. Please try again later.",
                  );
                  return;
                }
                if (!orderingOpen) {
                  toast.error(
                    "Orders can only be placed between 7:00 AM and 9:00 PM",
                  );
                  return;
                }
                setShowCheckout(true);
              }}
              disabled={showCheckout}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              <CreditCard size={18} />
              {isAuthenticated ? "Proceed to Checkout" : "Sign in to Checkout"}
            </button>

            {!shopOpen && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertTriangle size={16} className="shrink-0" />
                <span>
                  Shop is currently closed. Orders cannot be placed right now.
                </span>
              </div>
            )}

            {shopOpen && !orderingOpen && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                <AlertTriangle size={16} className="shrink-0" />
                <span>
                  Ordering is available only between 7:00 AM – 9:00 PM. Please
                  come back during ordering hours.
                </span>
              </div>
            )}

            {showCheckout && (
              <div className="border-t border-border pt-4 mt-4 space-y-3">
                {/* Delivery Location */}
                <h3 className="font-semibold text-sm">Delivery Location</h3>
                <LocationPicker
                  autoDetect
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
                    if (!address.trim()) {
                      toast.error("Please enter a delivery address");
                      return;
                    }
                    setPlacing(true);
                    try {
                      if (paymentMethod === "esewa") {
                        const res = await orderAPI.initiateEsewa({
                          address: address.trim(),
                          lat,
                          lng,
                          orderType: "delivery",
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
                        address: address.trim(),
                        lat,
                        lng,
                        paymentMethod: "cod",
                        orderType: "delivery",
                      });
                      toast.success("Order placed successfully!");
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
              className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-surface-light text-text font-medium rounded-xl hover:bg-gray-200 transition-all text-sm mt-3"
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
