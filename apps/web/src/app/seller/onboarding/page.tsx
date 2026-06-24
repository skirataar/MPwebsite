"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If they are already onboarded, send them to dashboard
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.onboardingComplete) {
      router.push("/seller/dashboard");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[onboarding client] Form submitted. storeName:", storeName, "phone:", phone);
    if (!storeName || !phone) {
      console.warn("[onboarding client] Validation failed: missing storeName or phone");
      setError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("[onboarding client] Fetching /api/seller/onboarding...");
      const res = await fetch("/api/seller/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, phone, bio }),
      });

      console.log("[onboarding client] Fetch status:", res.status);
      if (!res.ok) {
        const data = await res.json();
        console.error("[onboarding client] API error response:", data);
        throw new Error(data.error || "Failed to save details");
      }

      const responseData = await res.json();
      console.log("[onboarding client] API success response:", responseData);

      console.log("[onboarding client] Calling next-auth session update...");
      // Update the client-side session to reflect onboarding is complete
      const sessionUpdateResult = await update({ onboardingComplete: true });
      console.log("[onboarding client] Session update completed. Result:", sessionUpdateResult);
      
      console.log("[onboarding client] Redirecting to /seller/dashboard via hard page load...");
      // Use hard location redirect to avoid Next.js router cache / middleware race conditions
      window.location.href = "/seller/dashboard";
    } catch (err: any) {
      console.error("[onboarding client] Error caught in handleSubmit:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse font-body-md text-on-surface">Loading setup...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-on-surface font-body-md antialiased flex flex-col items-center py-huge px-md selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-tertiary-container/5 blur-3xl" />
      </div>

      <div className="w-full max-w-lg bg-surface border-[0.5px] border-outline-variant rounded-[24px] shadow-sm p-xl flex flex-col gap-lg relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-sm mb-sm">
          <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center shadow-sm mb-xs">
            <span className="material-symbols-outlined text-on-primary-container text-[32px]">store</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            Welcome, Artisan
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Before you can start selling your handcrafted videos, we need a few details about your boutique.
          </p>
        </div>

        {error && (
          <div className="p-sm bg-error-container text-on-error-container rounded-lg text-sm text-center border-[0.5px] border-error/20">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          
          <div className="flex flex-col gap-xs">
            <label htmlFor="storeName" className="font-label-md text-label-md font-bold text-on-surface">
              Boutique Name <span className="text-error">*</span>
            </label>
            <input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Handmade Jaipur Treasures"
              className="w-full h-12 bg-surface-variant/50 border-[0.5px] border-outline-variant rounded-xl px-sm font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
              required
            />
            <p className="font-label-sm text-[11px] text-on-surface-variant opacity-80 mt-1">
              This is how your shop will appear to customers.
            </p>
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="phone" className="font-label-md text-label-md font-bold text-on-surface">
              Phone Number <span className="text-error">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-12 bg-surface-variant/50 border-[0.5px] border-outline-variant rounded-xl px-sm font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
              required
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="bio" className="font-label-md text-label-md font-bold text-on-surface">
              Shop Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell shoppers about your craft, your materials, and your story..."
              className="w-full h-32 bg-surface-variant/50 border-[0.5px] border-outline-variant rounded-xl p-sm font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[52px] bg-primary text-on-primary font-body-lg font-bold rounded-xl mt-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-on-primary"></div>
            ) : (
              "Complete Setup & Open Shop"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
