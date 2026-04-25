import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { cartAPI } from "../api/cartAPI";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const GUEST_CART_KEY = "guestCart";

const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [cart, setCart] = useState(null);
  const [guestItems, setGuestItems] = useState(getGuestCart);
  const [loading, setLoading] = useState(false);

  const cartItems = isAuthenticated ? cart?.items || [] : guestItems;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.productId?.price || item.price || 0;
    const discount = item.productId?.discount || item.discount || 0;
    const discountedPrice = price * (1 - discount / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

  // Sync guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      saveGuestCart(guestItems);
    }
  }, [guestItems, isAuthenticated]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || isAdmin) return;
    setLoading(true);
    try {
      const res = await cartAPI.get();
      setCart(res.data.data?.cart || res.data.cart || null);
    } catch {
      // cart might not exist yet
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Merge guest cart into server cart on login
  const mergeGuestCart = useCallback(async () => {
    const guest = getGuestCart();
    if (guest.length === 0) return;
    try {
      for (const item of guest) {
        const productId = item.productId?._id || item.productId;
        await cartAPI.add({ productId, quantity: item.quantity });
      }
      clearGuestCart();
      setGuestItems([]);
    } catch {
      // merge failed, keep guest items
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      mergeGuestCart().then(fetchCart);
    }
  }, [isAuthenticated, isAdmin, fetchCart, mergeGuestCart]);

  const addToCart = async (productId, quantity = 1, productData = null) => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.add({ productId, quantity });
        setCart(res.data.data?.cart || res.data.cart || null);
        toast.success("Added to cart!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to add to cart");
      }
    } else {
      // Guest cart - store in localStorage
      setGuestItems((prev) => {
        const existing = prev.find(
          (item) => (item.productId?._id || item.productId) === productId,
        );
        if (existing) {
          return prev.map((item) =>
            (item.productId?._id || item.productId) === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        // Store product data for display
        return [
          ...prev,
          {
            _id: `guest_${productId}`,
            productId: productData || { _id: productId },
            quantity,
            price: productData?.price || 0,
            discount: productData?.discount || 0,
          },
        ];
      });
      toast.success("Added to cart!");
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (isAuthenticated) {
      const prevCart = cart;
      setCart((prev) => {
        if (!prev) return prev;
        const items = prev.items.map((item) => {
          const id = item.productId?._id || item.productId;
          if (id === productId) return { ...item, quantity };
          return item;
        });
        return { ...prev, items };
      });
      try {
        const res = await cartAPI.update({ productId, quantity });
        setCart(res.data.data?.cart || res.data.cart || null);
      } catch (err) {
        setCart(prevCart);
        toast.error(err.response?.data?.message || "Failed to update cart");
      }
    } else {
      setGuestItems((prev) =>
        prev.map((item) =>
          (item.productId?._id || item.productId) === productId
            ? { ...item, quantity }
            : item,
        ),
      );
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      const prevCart = cart;
      setCart((prev) => {
        if (!prev) return prev;
        const items = prev.items.filter((item) => {
          const id = item.productId?._id || item.productId;
          return id !== productId;
        });
        return { ...prev, items };
      });
      try {
        const res = await cartAPI.remove({ productId });
        setCart(res.data.data?.cart || res.data.cart || null);
      } catch (err) {
        setCart(prevCart);
        toast.error(err.response?.data?.message || "Failed to remove item");
      }
    } else {
      setGuestItems((prev) =>
        prev.filter(
          (item) => (item.productId?._id || item.productId) !== productId,
        ),
      );
    }
  };

  const clearCartState = () => {
    setCart(null);
    setGuestItems([]);
    clearGuestCart();
  };

  const value = {
    cart,
    cartItems,
    cartCount,
    cartTotal,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCartState,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
