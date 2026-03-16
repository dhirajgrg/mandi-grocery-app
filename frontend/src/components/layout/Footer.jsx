import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="border-t border-border bg-green-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link
              to="/"
              className="inline-block hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              <img
                src="/logo.png"
                alt="logo"
                className="h-20 w-auto mb-3 cursor-pointer"
              />
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              Fresh groceries delivered to your doorstep. Fast, reliable, and
              always fresh.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3 text-text uppercase tracking-wide">
              Shop
            </h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link
                  to="/"
                  className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/deals"
                  className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                >
                  Deals
                </Link>
              </li>
              {!isAdmin && (
                <li>
                  <Link
                    to="/contact"
                    className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                  >
                    Contact
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3 text-text uppercase tracking-wide">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-text-muted">
              {!isAuthenticated && (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                    >
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                    >
                      Sign up
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/profile"
                  className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                >
                  Profile
                </Link>
              </li>
              <li>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/cart"
                    className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                  >
                    Cart
                  </Link>
                )}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3 text-text uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link
                  to="/terms"
                  className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="inline-block hover:text-text hover:translate-y-0.5 transition-all"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Mandi. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
