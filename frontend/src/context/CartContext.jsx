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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.productId?.price || item.price || 0;
    const discount = item.discount || 0;
    const discountedPrice = price * (1 - discount / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

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

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await cartAPI.add({ productId, quantity });
      setCart(res.data.data?.cart || res.data.cart || null);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const updateCartItem = async (productId, quantity) => {
    // Optimistic update
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
  };

  const removeFromCart = async (productId) => {
    // Optimistic update
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
  };

  const clearCartState = () => setCart(null);

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
