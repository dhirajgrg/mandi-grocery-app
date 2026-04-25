import { useState, useEffect } from "react";
import { Phone, Clock } from "lucide-react";
import { authAPI } from "../../api/authAPI";

const ContactPage = () => {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    authAPI
      .getAdminContact()
      .then((res) => setContact(res.data.data?.contact || null))
      .catch(() => {});
  }, []);

  const phone = contact?.mobile || "9800000000";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-text-muted mt-1">
          We&apos;d love to hear from you. Reach out anytime!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <a
            href={`tel:+977${phone}`}
            className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-border hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                Call Us
              </h3>
              <p className="text-text-muted text-sm">
                <span className="font-medium text-text">+977</span> {phone}
              </p>
              <p className="text-xs text-primary mt-0.5">
                Tap to call admin directly
              </p>
            </div>
          </a>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-border">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Working Hours</h3>
              <p className="text-text-muted text-sm">
                Sun - Fri: 7:00 AM - 9:00 PM
              </p>
              <p className="text-text-muted text-sm">
                Saturday: 8:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border">
          <h2 className="text-xl font-bold mb-4">Send us a message</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              // placeholder
            }}
          >
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="98XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="How can we help?"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
