import { Mail, Phone, MapPin, Clock } from "lucide-react";

const ContactPage = () => {
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
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-border">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Phone</h3>
              <p className="text-text-muted text-sm">+977 9800000000</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-border">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-text-muted text-sm">support@mandi.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-border">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Address</h3>
              <p className="text-text-muted text-sm">Kathmandu, Nepal</p>
            </div>
          </div>

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
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
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
