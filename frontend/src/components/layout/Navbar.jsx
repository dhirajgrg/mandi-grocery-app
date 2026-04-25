import { useState, useEffect, useRef } from "react";
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
  User,
  Settings,
  Sun,
  Moon,
  ChevronDown,
  Bell,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { onEvent, notifCount, clearNotifs, incrementNotifs } = useSocket();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Listen for real-time socket events
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isAdmin) {
      // Admin: always increment on new orders (bell count stays until orders tab is viewed)
      return onEvent("order_update", (data) => {
        if (data.type === "new_order") incrementNotifs();
      });
    } else {
      return onEvent("order_status_changed", () => {
        if (location.pathname === "/orders") return;
        incrementNotifs();
      });
    }
  }, [isAuthenticated, isAdmin, onEvent, incrementNotifs, location.pathname]);

  // Clear notifications when customer visits orders page
  useEffect(() => {
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
            {isAuthenticated ? (
              <>
                {/* Bell Notification */}
                <Link
                  to={isAdmin ? "/admin?tab=orders" : "/orders"}
                  onClick={clearNotifs}
                  className="relative p-2 rounded-lg text-text hover:bg-surface-light hover:-translate-y-0.5 active:scale-90 transition-all duration-200"
                >
                  <Bell size={20} />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                      {notifCount}
                    </span>
                  )}
                </Link>

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

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      dropdownOpen
                        ? "bg-surface-light"
                        : "hover:bg-surface-light"
                    }`}
                  >
                    <div className="relative h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold overflow-hidden">
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
                    <ChevronDown
                      size={14}
                      className={`text-text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-border shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-sm font-semibold truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          +977 {user?.mobile}
                        </p>
                      </div>

                      <div className="py-1">
                        {/* Admin items */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-light transition-colors"
                          >
                            <LayoutDashboard
                              size={16}
                              className="text-text-muted"
                            />
                            Dashboard
                          </Link>
                        )}

                        {/* Customer items */}
                        {!isAdmin && (
                          <>
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-light transition-colors"
                            >
                              <User size={16} className="text-text-muted" />
                              Profile
                            </Link>
                            <Link
                              to="/orders"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-light transition-colors"
                            >
                              <ClipboardList
                                size={16}
                                className="text-text-muted"
                              />
                              Order History
                            </Link>
                          </>
                        )}

                        {/* Common: Settings */}
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-light transition-colors"
                        >
                          <Settings size={16} className="text-text-muted" />
                          Settings
                        </Link>

                        {/* Theme Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTheme();
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-light transition-colors w-full"
                        >
                          {dark ? (
                            <Sun size={16} className="text-text-muted" />
                          ) : (
                            <Moon size={16} className="text-text-muted" />
                          )}
                          {dark ? "Light Mode" : "Dark Mode"}
                        </button>
                      </div>

                      <div className="border-t border-border pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors w-full"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
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
            {/* Mobile Bell */}
            {isAuthenticated && (
              <Link
                to={isAdmin ? "/admin?tab=orders" : "/orders"}
                onClick={clearNotifs}
                className="relative p-2 hover:-translate-y-0.5 active:scale-90 transition-all duration-200"
              >
                <Bell size={20} />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                    {notifCount}
                  </span>
                )}
              </Link>
            )}
            {!isAdmin && (
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
              className="relative p-2 rounded-lg hover:bg-surface-light active:scale-90 transition-all duration-200"
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
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3">
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
                    <p className="text-xs text-text-muted">
                      +977 {user?.mobile}
                    </p>
                  </div>
                </div>

                {/* Admin: Dashboard */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                )}

                {/* Customer: Profile & Orders */}
                {!isAdmin && (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
                    >
                      <User size={18} />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
                    >
                      <ClipboardList size={18} />
                      Order History
                    </Link>
                  </>
                )}

                {/* Common: Settings */}
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light hover:translate-x-1 active:scale-[0.98] transition-all duration-200"
                >
                  <Settings size={18} />
                  Settings
                </Link>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-surface-light hover:translate-x-1 active:scale-[0.98] w-full transition-all duration-200"
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                  {dark ? "Light Mode" : "Dark Mode"}
                </button>

                <div className="border-t border-border my-1" />

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
