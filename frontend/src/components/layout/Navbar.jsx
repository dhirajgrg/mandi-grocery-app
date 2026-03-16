import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";
import {
  ShoppingCart,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Home,
  ShoppingBag,
  Phone,
  Tag,
  Sun,
  Moon,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { onEvent, notifCount, clearNotifs, incrementNotifs } = useSocket();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Listen for real-time socket events
  useEffect(() => {
    if (!isAuthenticated) return;
    const event = isAdmin ? "new_order" : "order_status_changed";
    return onEvent(event, () => {
      // Don't increment if already viewing the relevant page
      if (isAdmin && location.pathname === "/admin") return;
      if (!isAdmin && location.pathname === "/orders") return;
      incrementNotifs();
    });
  }, [isAuthenticated, isAdmin, onEvent, incrementNotifs, location.pathname]);

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
    ...(!isAdmin ? [{ to: "/contact", label: "Contact", icon: Phone }] : []),
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
          <Link
            to="/"
            className="h-16 flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <img src="/logo.png" alt="logo" className="h-14 w-auto" />
          </Link>

          {/* Desktop Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isActive(to)
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:text-text hover:bg-surface-light"
                }`}
              >
                <Icon
                  size={16}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-lg text-text-muted hover:bg-surface-light hover:rotate-12 active:scale-90 transition-all duration-200"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Sun
                size={18}
                className={`absolute inset-0 m-auto transition-all duration-300 ${dark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`}
              />
              <Moon
                size={18}
                className={`transition-all duration-300 ${dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`}
              />
            </button>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      location.pathname === "/admin"
                        ? "bg-primary text-white"
                        : "text-text hover:bg-surface-light"
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
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
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
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
                    className="relative p-2 rounded-lg text-text hover:bg-surface-light hover:-translate-y-0.5 active:scale-90 transition-all duration-200"
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
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
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
                  className="p-2 rounded-lg text-text-muted hover:bg-surface-light hover:text-error hover:-translate-y-0.5 active:scale-90 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-text hover:bg-surface-light hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-lg text-text-muted hover:bg-surface-light hover:rotate-12 active:scale-90 transition-all duration-200"
            >
              <Sun
                size={18}
                className={`absolute inset-0 m-auto transition-all duration-300 ${dark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`}
              />
              <Moon
                size={18}
                className={`transition-all duration-300 ${dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`}
              />
            </button>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/cart"
                className="relative p-2 hover:-translate-y-0.5 active:scale-90 transition-all duration-200"
              >
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
              className="p-2 rounded-lg hover:bg-surface-light active:scale-90 transition-all duration-200"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-3 space-y-1">
            {/* Nav Links */}
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 active:scale-[0.98] ${
                  isActive(to)
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-surface-light hover:translate-x-1"
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-light hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-error hover:bg-error/5 hover:translate-x-1 active:scale-[0.98] w-full transition-all duration-200"
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
                  className="block px-4 py-3 text-sm font-semibold text-center rounded-lg border border-border hover:bg-surface-light active:scale-[0.98] transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-center text-white bg-primary rounded-lg active:scale-[0.98] transition-all duration-200"
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
