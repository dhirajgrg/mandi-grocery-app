import { useEffect, useState } from "react";
import {
  X,
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  ShoppingBag,
} from "lucide-react";

const STATUS_ICONS = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
  confirmed: { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-50" },
  packed: { icon: Package, color: "text-indigo-500", bg: "bg-indigo-50" },
  out_for_delivery: {
    icon: Truck,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  new_order: { icon: ShoppingBag, color: "text-green-500", bg: "bg-green-50" },
};

const NotificationPopup = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-100 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <NotificationItem key={notif.id} notif={notif} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const NotificationItem = ({ notif, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      handleDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(notif.id), 300);
  };

  const config = STATUS_ICONS[notif.type] || STATUS_ICONS.pending;
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-border shadow-lg transition-all duration-300 ${
        visible && !exiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div className={`p-2 rounded-xl ${config.bg} shrink-0`}>
        <Icon size={20} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text">{notif.title}</p>
        <p className="text-xs text-text-muted mt-0.5">{notif.message}</p>
        {notif.time && (
          <p className="text-[10px] text-text-muted/60 mt-1">{notif.time}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-surface-light transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default NotificationPopup;
