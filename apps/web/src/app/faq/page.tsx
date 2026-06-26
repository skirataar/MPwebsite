"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "delivery" | "payment" | "seller";
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "general",
    question: "What is V-Market India?",
    answer: "V-Market India is a premium shoppable video platform showcasing artisan-crafted and premium goods from all over India. You can watch short video feeds and buy items directly from local creators.",
  },
  {
    category: "general",
    question: "Do I need an account to buy products?",
    answer: "Yes, you need to sign in to place orders, track shipments, and customize your video feed preferences. You can sign in using Google or other supported authentication options.",
  },
  {
    category: "delivery",
    question: "How long does shipping and delivery take?",
    answer: "Since most items are handcrafted by artisans, processing times vary. Typically, orders ship within 2-3 business days and arrive at your doorstep within 5-7 business days depending on your location.",
  },
  {
    category: "delivery",
    question: "How can I track my order?",
    answer: "Once shipped, you can find the tracking details under the 'My Orders' section in your account dashboard. We will also send updates to your registered email address.",
  },
  {
    category: "payment",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards, Net Banking, UPI, and popular digital wallets. All transactions are securely processed through our premium payment gateway partner, Razorpay.",
  },
  {
    category: "payment",
    question: "Is cash on delivery (COD) available?",
    answer: "Currently, we only support secure pre-paid online payments. This helps us ensure that our hard-working independent artisans receive immediate payment processing and commitment for their orders.",
  },
  {
    category: "seller",
    question: "How can I become an artisan seller on V-Market?",
    answer: "We welcome passionate artisans! You can apply for a seller account in the Settings dashboard. Once approved, you can start upload video reels, tag your products, and check sales analytics from the Studio Dashboard.",
  },
  {
    category: "seller",
    question: "What are the fees for selling?",
    answer: "Creating a seller profile and listing products is completely free. We only charge a small platform commission fee on successful transactions to cover payment gateways and operations.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "general", label: "General" },
  { id: "delivery", label: "Shipping & Delivery" },
  { id: "payment", label: "Payments" },
  { id: "seller", label: "Artisans & Selling" },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);

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

  const handleToggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Filter FAQs based on category and search query
  const filteredFAQs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface antialiased flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Sticky Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md px-md py-sm flex items-center justify-between border-b border-outline-variant/30 max-w-lg mx-auto right-0">
        <div className="flex items-center gap-sm">
          <Link href="/" aria-label="Go back" className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </Link>
          <h1 className="font-body-lg text-body-lg font-medium text-on-surface">FAQ & Help</h1>
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

      {/* Main Content Layout */}
      <main className="flex-grow pt-[72px] pb-lg px-md max-w-lg mx-auto w-full flex flex-col justify-start gap-md">
        
        {/* Intro */}
        <section className="text-center py-xs flex flex-col gap-base">
          <h2 className="text-headline-md font-bold tracking-tight text-primary dark:text-primary-fixed-dim">How can we help?</h2>
          <p className="text-[13px] text-on-surface-variant leading-relaxed">
            Find answers to commonly asked questions or connect with us directly.
          </p>
        </section>

        {/* Search Input Card */}
        <div className="relative bg-surface rounded-xl border border-outline-variant p-[4px] shadow-sm flex items-center">
          <span className="material-symbols-outlined text-on-surface-variant/70 pl-sm pr-xs text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedIndex(null); // Reset open questions during search
            }}
            className="flex-1 bg-transparent py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="p-xs hover:text-on-surface text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-xs overflow-x-auto pb-xs hide-scrollbar -mx-md px-md shrink-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setExpandedIndex(null);
                }}
                className={`whitespace-nowrap px-md py-[6px] rounded-full text-label-xs font-semibold border transition-all active:scale-95 ${
                  isSelected
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Accordion Questions List */}
        <section className="flex flex-col gap-sm">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-surface rounded-xl border-[0.5px] border-outline-variant shadow-sm overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => handleToggleAccordion(idx)}
                    className="w-full px-md py-md flex justify-between items-center text-left hover:bg-surface-container-low/50 transition-colors"
                  >
                    <span className="font-body-sm font-semibold text-on-surface pr-sm leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      keyboard_arrow_down
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? "max-h-[300px] border-t border-outline-variant/30" : "max-h-0"
                    } overflow-hidden`}
                  >
                    <div className="px-md py-md text-[13.5px] leading-relaxed text-on-surface-variant bg-surface-container-lowest/45">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-lg bg-surface border border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-md text-on-surface-variant gap-xs">
              <span className="material-symbols-outlined text-[36px] opacity-40">help_center</span>
              <span className="font-semibold text-body-sm">No matches found</span>
              <span className="text-xs opacity-75">Try clearing your filters or query.</span>
            </div>
          )}
        </section>

        {/* Support Call To Action */}
        <section className="bg-primary/5 dark:bg-primary-container/10 border border-primary/20 rounded-xl p-md flex flex-col gap-sm items-center text-center mt-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-[20px]">support_agent</span>
          </div>
          <div className="flex flex-col gap-base">
            <h3 className="font-semibold text-body-sm text-on-surface">Still have questions?</h3>
            <p className="text-xs text-on-surface-variant max-w-[280px]">
              If you didn't find what you need, feel free to send us an inquiry and our support team will assist you.
            </p>
          </div>
          <Link
            href="/contact?from=faq"
            className="h-[36px] px-lg rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center transition-all hover:opacity-90 active:scale-95 shadow-sm mt-xs"
          >
            Contact Us
          </Link>
        </section>

      </main>
    </div>
  );
}
