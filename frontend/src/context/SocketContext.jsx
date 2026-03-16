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

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
