import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-green-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src="/logo.png" alt="logo" className="h-20 w-auto mb-3" />
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
                <Link to="/" className="hover:text-text transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-text transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-text transition-colors">
                  Deals
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-text transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3 text-text uppercase tracking-wide">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link to="/login" className="hover:text-text transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="hover:text-text transition-colors"
                >
                  Sign up
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-text transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-text transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3 text-text uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <span className="hover:text-text cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-text cursor-pointer transition-colors">
                  Privacy Policy
                </span>
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
