"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function SellerLoginContent() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams ? searchParams.get("redirect") : null;
  const redirectPath = !rawRedirect || rawRedirect === "/" ? "/seller/dashboard" : rawRedirect;
  const initialTab = searchParams && searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    // Theme sync on mount
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = theme === "dark" || (!theme && systemPrefersDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: `/auth-sync?role=SELLER&redirect=${encodeURIComponent(redirectPath)}` });
  };

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface antialiased flex flex-col justify-center items-center font-body-md px-md selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-tertiary-container/5 blur-3xl" />
      </div>

      {/* 1. Header (Sticky App Bar) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md px-md py-sm flex items-center justify-between border-b border-outline-variant/30 max-w-lg mx-auto right-0">
        <Link href="/" aria-label="Cancel and go back" className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center">
          <span className="material-symbols-outlined" data-icon="close">close</span>
        </Link>
        <span className="font-body-lg text-body-lg font-medium">Artisan Seller Portal</span>
        <div className="w-6"></div> {/* Spacer to center the title */}
      </header>

      {/* 2. Login Portal Main Card */}
      <div className="w-full max-w-sm bg-surface rounded-[24px] border-[0.5px] border-outline-variant p-lg flex flex-col gap-lg shadow-lg mt-huge relative z-10">
        <div className="flex flex-col gap-xs text-center items-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm mb-sm">
            <span className="material-symbols-outlined text-on-primary text-[28px]">storefront</span>
          </div>
          <h1 className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary">
            Artisan Seller Studio
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Manage your digital boutique store, view orders, and publish your handcrafted video listings.
          </p>
        </div>

        {/* Tab Selection Segments */}
        <div className="grid grid-cols-2 gap-sm p-xs bg-surface-container-low rounded-lg">
          <button
            onClick={() => setActiveTab("signin")}
            className={`h-[36px] rounded-md font-body-sm text-[13px] font-medium transition-all ${
              activeTab === "signin"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Studio Sign In
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`h-[36px] rounded-md font-body-sm text-[13px] font-medium transition-all ${
              activeTab === "signup"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Create Boutique
          </button>
        </div>

        <div className="flex justify-center mt-md w-full">
           <button 
             onClick={handleGoogleLogin}
             className="h-[50px] w-full border border-outline-variant bg-surface rounded-xl font-body-sm font-bold text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center shadow-sm gap-sm"
           >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             {activeTab === "signin" ? "Sign In with Google" : "Create Boutique with Google"}
           </button>
        </div>

        <div className="border-t border-outline-variant/30 pt-md text-center flex flex-col gap-xs">
          <p className="font-label-xs text-label-xs text-on-surface-variant opacity-80">
            Looking for shopper log in?
          </p>
          <Link 
            href="/login"
            className="text-primary font-bold hover:underline font-label-xs text-label-xs"
          >
            Go to Customer Shop Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <Suspense fallback={
      <div className="w-screen min-h-screen bg-background text-on-surface flex items-center justify-center font-body-md">
        <div className="animate-pulse">Loading auth configurations...</div>
      </div>
    }>
      <SellerLoginContent />
    </Suspense>
  );
}
