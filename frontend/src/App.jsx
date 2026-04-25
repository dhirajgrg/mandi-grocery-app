import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useRef } from "react";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import HomePage from "./pages/Home/HomePage";
import ProductsPage from "./pages/Products/ProductsPage";
import DealsPage from "./pages/Deals/DealsPage";
import ContactPage from "./pages/Contact/ContactPage";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import CartPage from "./pages/Cart/CartPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import SettingsPage from "./pages/Settings/SettingsPage";
import OrdersPage from "./pages/Orders/OrdersPage";
import AdminPage from "./pages/Admin/AdminPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentFailurePage from "./pages/Payment/PaymentFailurePage";
import TermsOfServicePage from "./pages/Legal/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/Legal/PrivacyPolicyPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";

// Redirect to home on first app load (fresh page load / refresh)
const RedirectToHomeOnLoad = ({ children }) => {
  const location = useLocation();
  const hasRedirected = useRef(false);

  if (!hasRedirected.current && location.pathname !== "/") {
    hasRedirected.current = true;
    return <Navigate to="/" replace />;
  }
  hasRedirected.current = true;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <RedirectToHomeOnLoad>
        <Routes>
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Cart is public (guest cart supported) */}
            <Route path="/cart" element={<CartPage />} />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute customerOnly>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute customerOnly>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/failure"
              element={
                <ProtectedRoute customerOnly>
                  <PaymentFailurePage />
                </ProtectedRoute>
              }
            />

            {/* Admin only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </RedirectToHomeOnLoad>
    </BrowserRouter>
  );
}

export default App;
