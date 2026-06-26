"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SubmittedDetails {
  refId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedDetails | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [backHref, setBackHref] = useState("/");

  useEffect(() => {
    // Theme Sync
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = theme === "dark" || (!theme && systemPrefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Parse back URL safely on client-side
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("from") === "faq") {
        setBackHref("/faq");
      } else {
        setBackHref("/");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!message.trim()) {
      newErrors.message = "Message is required";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedData({
          refId: data.refId,
          name,
          email,
          subject,
          message,
        });
        // Clear fields
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        alert("Failed to submit inquiry. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface antialiased flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md px-md py-sm flex items-center justify-between border-b border-outline-variant/30 max-w-lg mx-auto right-0">
        <div className="flex items-center gap-sm">
          <Link href={backHref} aria-label="Go back" className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </Link>
          <h1 className="font-body-lg text-body-lg font-medium text-on-surface">Contact Us</h1>
        </div>
        <div className="flex items-center gap-md">
          {/* Dark Mode toggle */}
          <button 
            onClick={toggleTheme}
            className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center justify-center"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isDark ? "'FILL' 1" : "'FILL' 0" }}>
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-[72px] pb-lg px-md max-w-lg mx-auto w-full flex flex-col justify-start gap-lg">
        
        {submittedData ? (
          /* Submission success view */
          <div className="flex flex-col gap-lg items-center py-md animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim shadow-sm">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'wght' 600" }}>check_circle</span>
            </div>
            
            <div className="text-center flex flex-col gap-base">
              <h2 className="text-headline-md font-bold tracking-tight text-on-surface">Message Received!</h2>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Thank you for contacting us. We have successfully registered your inquiry.
              </p>
            </div>

            <div className="w-full bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-sm shadow-sm">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Reference ID</span>
                <span className="font-mono text-xs font-bold text-primary dark:text-primary-fixed-dim">{submittedData.refId}</span>
              </div>
              <div className="flex flex-col gap-base text-body-sm pt-xs">
                <span className="text-xs text-on-surface-variant">From: <strong className="text-on-surface">{submittedData.name}</strong> ({submittedData.email})</span>
                <span className="text-xs text-on-surface-variant">Subject: <strong className="text-on-surface">{submittedData.subject}</strong></span>
              </div>
              <div className="bg-surface-container-low rounded-lg p-sm border border-outline-variant/20 mt-xs">
                <p className="text-xs text-on-surface-variant leading-relaxed italic">
                  "{submittedData.message}"
                </p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant text-center max-w-[280px]">
              Our support representatives typically reply within 24 business hours.
            </p>

            <div className="flex gap-sm w-full pt-sm">
              <button
                onClick={() => setSubmittedData(null)}
                className="flex-1 h-[44px] rounded-lg border border-outline-variant text-on-surface bg-transparent font-bold text-xs hover:bg-surface-container active:scale-95 transition-all"
              >
                Send Another
              </button>
              <Link
                href="/"
                className="flex-1 h-[44px] rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Go to Feed
              </Link>
            </div>
          </div>
        ) : (
          /* Main Input Form View */
          <>
            <section className="text-center py-xs flex flex-col gap-base">
              <h2 className="text-headline-md font-bold tracking-tight text-primary dark:text-primary-fixed-dim">Get in touch</h2>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Have an inquiry about an order, a product video, or listing your craft? Shoot us a message below.
              </p>
            </section>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {/* Name Input */}
              <div className="flex flex-col gap-xs">
                <label htmlFor="name-input" className="text-xs font-bold text-on-surface-variant tracking-wide">
                  YOUR NAME
                </label>
                <input
                  id="name-input"
                  type="text"
                  placeholder="e.g., Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className={`bg-surface rounded-xl border p-md text-body-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 ${
                    errors.name ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"
                  }`}
                />
                {errors.name && <span className="text-xs text-error font-semibold pl-xs">{errors.name}</span>}
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-xs">
                <label htmlFor="email-input" className="text-xs font-bold text-on-surface-variant tracking-wide">
                  EMAIL ADDRESS
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="e.g., rajesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className={`bg-surface rounded-xl border p-md text-body-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 ${
                    errors.email ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"
                  }`}
                />
                {errors.email && <span className="text-xs text-error font-semibold pl-xs">{errors.email}</span>}
              </div>

              {/* Subject Input */}
              <div className="flex flex-col gap-xs">
                <label htmlFor="subject-input" className="text-xs font-bold text-on-surface-variant tracking-wide">
                  SUBJECT
                </label>
                <input
                  id="subject-input"
                  type="text"
                  placeholder="e.g., Question about artisan delivery"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSubmitting}
                  className={`bg-surface rounded-xl border p-md text-body-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 ${
                    errors.subject ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"
                  }`}
                />
                {errors.subject && <span className="text-xs text-error font-semibold pl-xs">{errors.subject}</span>}
              </div>

              {/* Message Input */}
              <div className="flex flex-col gap-xs">
                <label htmlFor="message-input" className="text-xs font-bold text-on-surface-variant tracking-wide">
                  MESSAGE
                </label>
                <textarea
                  id="message-input"
                  rows={4}
                  placeholder="Type your question or detail here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className={`bg-surface rounded-xl border p-md text-body-sm text-on-surface outline-none transition-all resize-none placeholder:text-on-surface-variant/40 ${
                    errors.message ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"
                  }`}
                />
                {errors.message && <span className="text-xs text-error font-semibold pl-xs">{errors.message}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[48px] rounded-xl bg-primary text-on-primary font-bold text-body-sm flex items-center justify-center gap-sm active:scale-[0.98] transition-all hover:opacity-90 disabled:opacity-50 mt-xs shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Send Message
                  </>
                )}
              </button>
            </form>

            {/* Direct Contact Details Cards */}
            <div className="border-t border-outline-variant/30 pt-lg mt-sm flex flex-col gap-sm">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Direct support details</h3>
              
              <div className="grid grid-cols-1 gap-sm">
                {/* Email Support */}
                <div className="bg-surface rounded-xl border border-outline-variant p-md flex items-start gap-md shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[20px] pt-[2px]">mail</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">Email Support</span>
                    <a href="mailto:support@vmarket.in" className="text-xs text-primary dark:text-primary-fixed-dim hover:underline mt-base">
                      support@vmarket.in
                    </a>
                  </div>
                </div>

                {/* Telephone Support */}
                <div className="bg-surface rounded-xl border border-outline-variant p-md flex items-start gap-md shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[20px] pt-[2px]">call</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">Helpline</span>
                    <span className="text-xs text-on-surface-variant mt-base">
                      +91 80 4390 1234 (Mon-Sat, 9AM - 6PM)
                    </span>
                  </div>
                </div>

                {/* Office address */}
                <div className="bg-surface rounded-xl border border-outline-variant p-md flex items-start gap-md shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[20px] pt-[2px]">location_on</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">Headquarters</span>
                    <span className="text-xs text-on-surface-variant leading-relaxed mt-base">
                      V-Market India Tech Private Limited,<br />
                      #12, 100 Feet Road, Indiranagar,<br />
                      Bengaluru, Karnataka - 560038
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
