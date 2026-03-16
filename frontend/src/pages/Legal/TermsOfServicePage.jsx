import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

const TermsOfServicePage = () => {
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
          <FileText size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Terms of Service</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Last updated: March 2026
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6">
        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">1. Acceptance of Terms</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            By accessing or using the Mandi grocery delivery and takeaway
            service, you agree to be bound by these Terms of Service. If you do
            not agree with any of these terms, please do not use our service.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">2. Service Description</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Mandi provides an online platform for purchasing groceries and fresh
            produce with options for home delivery and store takeaway (pickup).
            We reserve the right to modify, suspend, or discontinue any part of
            the service at any time.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">3. User Accounts</h2>
          <ul className="text-sm text-text-muted leading-relaxed space-y-2 list-disc pl-5">
            <li>
              You must provide accurate and complete information during
              registration.
            </li>
            <li>
              You are responsible for maintaining the security of your account
              credentials.
            </li>
            <li>You must verify your email address before placing orders.</li>
            <li>
              We reserve the right to suspend or terminate accounts that violate
              these terms.
            </li>
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">4. Orders & Payments</h2>
          <ul className="text-sm text-text-muted leading-relaxed space-y-2 list-disc pl-5">
            <li>
              All prices are listed in Nepalese Rupees (NPR) and are subject to
              change.
            </li>
            <li>
              Orders can be placed for delivery or takeaway (store pickup).
            </li>
            <li>
              We accept Cash on Delivery (COD) and eSewa as payment methods.
            </li>
            <li>
              Orders can only be cancelled while in &quot;Pending&quot; status.
            </li>
            <li>
              Product availability is subject to stock levels at the time of
              order processing.
            </li>
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">5. Delivery & Takeaway</h2>
          <ul className="text-sm text-text-muted leading-relaxed space-y-2 list-disc pl-5">
            <li>
              Delivery times are estimates and may vary based on location and
              demand.
            </li>
            <li>
              For takeaway orders, you will be notified when your order is ready
              for pickup.
            </li>
            <li>
              A valid delivery address must be provided for delivery orders.
            </li>
            <li>
              We are not responsible for delays caused by incorrect address
              information.
            </li>
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">6. Cancellation & Refunds</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Orders may be cancelled before they are confirmed. Once an order is
            confirmed, packed, or out for delivery, it cannot be cancelled.
            Refunds for eSewa payments will be processed back to the original
            payment method within 5-7 business days.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">7. Limitation of Liability</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Mandi shall not be liable for any indirect, incidental, or
            consequential damages arising from the use of our service. Our total
            liability shall not exceed the amount paid by you for the specific
            order in question.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">8. Changes to Terms</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            We may update these Terms of Service from time to time. Continued
            use of the service after changes constitutes acceptance of the new
            terms. We encourage you to review this page periodically.
          </p>
        </section>

        <section className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">9. Contact Us</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            If you have questions about these Terms of Service, please contact
            us through the Contact page or email us at support@mandi.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
