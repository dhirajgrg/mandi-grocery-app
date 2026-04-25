import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Shield size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Last updated: March 2026
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6">
        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">1. Information We Collect</h2>
          <p className="text-sm text-text-muted leading-relaxed mb-3">
            We collect information that you provide directly when using Mandi:
          </p>
          <ul className="text-sm text-text-muted leading-relaxed space-y-2 list-disc pl-5">
            <li>
              <strong>Account Information:</strong> Name, phone number, and
              password when you create an account.
            </li>
            <li>
              <strong>Order Information:</strong> Delivery address, location
              coordinates, order history, and payment method preferences.
            </li>
            <li>
              <strong>Payment Data:</strong> We do not store payment card
              details. eSewa payments are processed through eSewa&apos;s secure
              gateway.
            </li>
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">
            2. How We Use Your Information
          </h2>
          <ul className="text-sm text-text-muted leading-relaxed space-y-2 list-disc pl-5">
            <li>
              Processing and fulfilling your orders (delivery and takeaway).
            </li>
            <li>Sending order status updates and notifications.</li>
            <li>Verifying your mobile number and account security.</li>
            <li>Improving our products, services, and user experience.</li>
            <li>Communicating with you about your orders and account.</li>
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">3. Data Protection</h2>
          <ul className="text-sm text-text-muted leading-relaxed space-y-2 list-disc pl-5">
            <li>Passwords are hashed using industry-standard encryption.</li>
            <li>
              Secure HTTPS connections are used for all data transmission.
            </li>
            <li>
              Authentication tokens are used for session management and expire
              automatically.
            </li>
            <li>
              We implement appropriate technical and organizational measures to
              protect your personal data.
            </li>
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">4. Location Data</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            When you place a delivery order, we collect your delivery address
            and geographic coordinates to facilitate order delivery. This data
            is stored with your order and is only used for delivery purposes.
            For takeaway orders, no location data is collected.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">5. Cookies & Local Storage</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            We use cookies and local storage to maintain your login session,
            remember your preferences (such as theme settings), and provide a
            seamless experience. These are essential for the service to function
            properly.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">6. Third-Party Services</h2>
          <ul className="text-sm text-text-muted leading-relaxed space-y-2 list-disc pl-5">
            <li>
              <strong>eSewa:</strong> Payment processing is handled by eSewa.
              Your payment information is subject to eSewa&apos;s privacy
              policy.
            </li>
            <li>
              <strong>ImageKit:</strong> Product images may be served through
              ImageKit&apos;s CDN for faster loading.
            </li>
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">7. Your Rights</h2>
          <ul className="text-sm text-text-muted leading-relaxed space-y-2 list-disc pl-5">
            <li>Access your personal data through your profile page.</li>
            <li>Update your name and account information.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>View your complete order history.</li>
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">8. Data Retention</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            We retain your account and order data for as long as your account is
            active. Cancelled orders may be deleted by you at any time. If you
            request account deletion, we will remove your personal data within
            30 days.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">9. Changes to This Policy</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes through the app. Continued use of Mandi
            after changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">10. Contact Us</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            For privacy-related questions or requests, please contact us through
            the Contact page or email us at privacy@mandi.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
