import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useSocket } from "../../context/SocketContext";
import {
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Shield,
  ClipboardList,
  Home,
  ShoppingBag,
  Phone,
  Tag,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { onEvent, notifCount, clearNotifs, incrementNotifs } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Listen for real-time socket events
  useEffect(() => {
    if (!isAuthenticated) return;
    const event = isAdmin ? "new_order" : "order_status_changed";
    return onEvent(event, () => incrementNotifs());
  }, [isAuthenticated, isAdmin, onEvent, incrementNotifs]);

  // Clear notifications when visiting the relevant page
  useEffect(() => {
    if (isAdmin && location.pathname === "/admin") clearNotifs();
    if (!isAdmin && location.pathname === "/orders") clearNotifs();
  }, [location.pathname, isAdmin, clearNotifs]);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/products", label: "Products", icon: ShoppingBag },
    { to: "/deals", label: "Deals", icon: Tag },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="h-16 flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="logo" className="h-14 w-auto" />
          </Link>

          {/* Desktop Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(to)
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:text-text hover:bg-surface-light"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === "/admin"
                        ? "bg-primary text-white"
                        : "text-text hover:bg-surface-light"
                    }`}
                  >
                    <Shield size={16} />
                    Admin
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                )}
                {!isAdmin && (
                  <Link
                    to="/orders"
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === "/orders"
                        ? "bg-primary text-white"
                        : "text-text hover:bg-surface-light"
                    }`}
                  >
                    <ClipboardList size={16} />
                    Orders
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                )}
                {!isAdmin && (
                  <Link
                    to="/cart"
                    className="relative p-2 rounded-lg text-text hover:bg-surface-light transition-all"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === "/profile"
                      ? "bg-primary text-white"
                      : "hover:bg-surface-light"
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-text-muted hover:bg-surface-light hover:text-error transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-text hover:bg-surface-light transition-all"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-dark text-white transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && !isAdmin && (
              <Link to="/cart" className="relative p-2">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-surface-light"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-3 space-y-1">
            {/* Nav Links */}
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive(to)
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-surface-light"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            <div className="border-t border-border my-2" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-light"
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold overflow-hidden">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-text-muted">{user?.email}</p>
                  </div>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light"
                  >
                    <Shield size={18} />
                    Admin Dashboard
                    {notifCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                )}
                {!isAdmin && (
                  <Link
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light"
                  >
                    <ClipboardList size={18} />
                    My Orders
                    {notifCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-error hover:bg-error/5 w-full"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-center rounded-lg border border-border hover:bg-surface-light"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-center text-white bg-primary rounded-lg"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
