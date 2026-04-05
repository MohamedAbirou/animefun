import { useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

// -----------------------------------------------------------------------
// 1. Go to https://formspree.io and create a free account.
// 2. Create a new form — set the email you want messages delivered to.
// 3. Copy the form ID (the part after /f/ in the endpoint URL).
// 4. Replace YOUR_FORM_ID below with your actual form ID.
// -----------------------------------------------------------------------
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xpqoojll";

type Status = "idle" | "sending" | "success" | "error";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition";

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <SEOHead
        title="Contact Us — AnimeFun"
        description="Get in touch with the AnimeFun team. Send us your questions, suggestions, or content concerns and we'll get back to you within 2 business days."
        canonical="/contact"
      />

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 font-display">
          Contact Us
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Have a question or a suggestion? Fill out the form below and we'll get
          back to you within 2 business days.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-dark-border">
        {status === "success" ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Message sent!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thanks for reaching out. We'll reply within 2 business days.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                type="text"
                required
                placeholder="What's this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={6}
                placeholder="Tell us how we can help..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Something went wrong. Please try again or reach out directly via
                our{" "}
                <Link to="/faq" className="underline">
                  FAQ
                </Link>
                .
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>

            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              By submitting this form you agree to our{" "}
              <Link
                to="/privacy-policy"
                className="underline hover:text-primary-600 dark:hover:text-primary-400"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
        <Link
          to="/about"
          className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
        >
          About Us
        </Link>
        <span>·</span>
        <Link
          to="/faq"
          className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
        >
          FAQ
        </Link>
        <span>·</span>
        <Link
          to="/privacy-policy"
          className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default ContactPage;
