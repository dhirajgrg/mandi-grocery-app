import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import NotificationPopup from "../components/ui/NotificationPopup";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

let notifIdCounter = 0;
let orderSoundInterval = null;

const playOrderSoundOnce = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + i * 0.15 + 0.3,
      );
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch {
    // Audio not available
  }
};

const startOrderSound = () => {
  if (orderSoundInterval) return; // already ringing
  playOrderSoundOnce();
  orderSoundInterval = setInterval(playOrderSoundOnce, 3000);
};

const stopOrderSound = () => {
  if (orderSoundInterval) {
    clearInterval(orderSoundInterval);
    orderSoundInterval = null;
  }
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketReady(false);
      return;
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;
    setSocketReady(true);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [isAuthenticated, user]);

  const onEvent = useCallback(
    (event, handler) => {
      const s = socketRef.current;
      if (!s) return () => {};
      s.on(event, handler);
      return () => s.off(event, handler);
    },
    // socketReady ensures consumers re-register when socket is created
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [socketReady],
  );

  const addNotification = useCallback(({ title, message, type }) => {
    const id = ++notifIdCounter;
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setNotifications((prev) => [
      ...prev.slice(-4),
      { id, title, message, type, time },
    ]);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Listen for order status changes (customer) — show popup
  useEffect(() => {
    if (!isAuthenticated || !user || user.role === "admin") return;
    return onEvent("order_status_changed", (data) => {
      addNotification({
        title: `Order #${data.orderNumber}`,
        message:
          data.message ||
          `Status changed to ${data.statusLabel || data.status}`,
        type: data.status,
      });
    });
  }, [isAuthenticated, user, onEvent, addNotification]);

  // Listen for order updates (admin) — show popup
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "admin") return;
    return onEvent("order_update", (data) => {
      if (data.type === "new_order") {
        startOrderSound();
        addNotification({
          title: "New Order",
          message: `#${data.orderNumber} from ${data.customerName} — Rs.${Math.round(data.totalAmount)}`,
          type: "new_order",
        });
      } else if (data.type === "order_cancelled") {
        addNotification({
          title: "Order Cancelled",
          message: `#${data.orderNumber} cancelled by ${data.customerName}`,
          type: "cancelled",
        });
      } else if (data.type === "status_changed") {
        // Stop sound when any order is confirmed
        if (data.status === "confirmed") {
          stopOrderSound();
        }
        addNotification({
          title: `Order #${data.orderNumber}`,
          message: `Status updated to ${data.statusLabel || data.status}`,
          type: data.status,
        });
      }
    });
  }, [isAuthenticated, user, onEvent, addNotification]);

  const clearNotifs = useCallback(() => setNotifCount(0), []);
  const incrementNotifs = useCallback(() => setNotifCount((c) => c + 1), []);

  const effectiveNotifCount = isAuthenticated ? notifCount : 0;

  return (
    <SocketContext.Provider
      value={{
        onEvent,
        notifCount: effectiveNotifCount,
        setNotifCount,
        clearNotifs,
        incrementNotifs,
        addNotification,
        stopOrderSound,
      }}
    >
      {children}
      <NotificationPopup
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </SocketContext.Provider>
  );
};
