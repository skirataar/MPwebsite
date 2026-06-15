"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get("redirect") || "/" : "/";
  const initialTab = searchParams && searchParams.get("tab") === "signup" ? "signup" : "signin";

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);
  const [signupRole, setSignupRole] = useState<"customer" | "seller" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Auth URL error
  const authError = searchParams?.get("error");
  const urlErrorMessage =
    authError === "OAuthCallback"
      ? "There was a problem authenticating with Google. Please check your credentials."
      : authError
      ? "Authentication failed. Please try again."
      : null;

  // ─── Sign In ─────────────────────────────────────────────────────────────
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siError, setSiError] = useState<string | null>(null);
  const [siLoading, setSiLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiError(null);
    setSiLoading(true);
    try {
      const result = await signIn("credentials", {
        email: siEmail,
        password: siPassword,
        redirect: false,
      });
      if (result?.error) {
        setSiError("Invalid email or password. Please try again.");
      } else {
        router.push(redirectPath);
      }
    } catch {
      setSiError("Something went wrong. Please try again.");
    } finally {
      setSiLoading(false);
    }
  };

  // ─── Sign Up ──────────────────────────────────────────────────────────────
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suError, setSuError] = useState<string | null>(null);
  const [suLoading, setSuLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuError(null);
    setSuLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: suName, email: suEmail, password: suPassword, role: "BUYER" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSuError(data.error || "Registration failed. Please try again.");
      } else {
        // Auto sign-in after registration
        const result = await signIn("credentials", {
          email: suEmail,
          password: suPassword,
          redirect: false,
        });
        if (!result?.error) {
          router.push(redirectPath);
        } else {
          setSuError("Registered successfully! Please sign in manually.");
          setActiveTab("signin");
        }
      }
    } catch {
      setSuError("Something went wrong. Please try again.");
    } finally {
      setSuLoading(false);
    }
  };

  const handleGoogleLogin = (role: "BUYER" | "SELLER" = "BUYER") => {
    signIn("google", {
      callbackUrl: `/auth-sync?role=${role}&redirect=${encodeURIComponent(redirectPath)}`,
    });
  };

  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  const Divider = ({ label = "or" }: { label?: string }) => (
    <div className="flex items-center gap-sm">
      <div className="flex-1 h-px bg-outline-variant/40" />
      <span className="font-label-xs text-label-xs text-on-surface-variant/60">{label}</span>
      <div className="flex-1 h-px bg-outline-variant/40" />
    </div>
  );

  const inputClass =
    "h-[48px] px-md rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-body-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full";

  return (
    <div className="w-screen min-h-screen bg-surface-container-lowest text-on-surface flex items-center justify-center p-md font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-tertiary-container/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-surface border-[0.5px] border-outline-variant rounded-[24px] shadow-sm flex flex-col p-lg relative z-10 overflow-hidden">
        {/* Logo Header */}
        <div className="flex flex-col items-center gap-xs mb-xl">
          <Link
            href="/"
            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-on-primary text-[28px]">storefront</span>
          </Link>
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-sm">V-Market India</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center max-w-[280px]">
            Log in to continue to the premium artisan shopping experience.
          </p>
        </div>

        {urlErrorMessage && (
          <div className="mb-lg p-sm bg-error-container text-on-error-container rounded-lg text-sm text-center border-[0.5px] border-error/20">
            {urlErrorMessage}
          </div>
        )}

        {/* Tab Controls */}
        <div className="grid grid-cols-2 gap-sm p-xs bg-surface-container-low rounded-lg mb-lg">
          <button
            type="button"
            onClick={() => { setActiveTab("signin"); setSignupRole(null); }}
            className={`h-[36px] rounded-md font-body-sm text-[13px] font-medium transition-all ${
              activeTab === "signin"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={`h-[36px] rounded-md font-body-sm text-[13px] font-medium transition-all ${
              activeTab === "signup"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Register
          </button>
        </div>

        {/* ── SIGN IN ── */}
        {activeTab === "signin" && (
          <div className="flex flex-col gap-md w-full">
            {siError && (
              <div className="p-sm bg-error-container text-on-error-container rounded-lg text-sm text-center border-[0.5px] border-error/20">
                {siError}
              </div>
            )}

            <form onSubmit={handleSignIn} className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs">
                <label htmlFor="si-email" className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  Email
                </label>
                <input
                  id="si-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label htmlFor="si-password" className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="si-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-[48px]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={siLoading}
                className="h-[50px] w-full bg-primary text-on-primary rounded-xl font-body-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-sm shadow-sm mt-xs"
              >
                {siLoading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <Divider label="or continue with" />

            <button
              onClick={() => handleGoogleLogin("BUYER")}
              className="h-[50px] w-full border border-outline-variant bg-surface rounded-xl font-body-sm font-bold text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center shadow-sm gap-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>
        )}

        {/* ── REGISTER ── */}
        {activeTab === "signup" && (
          <div className="w-full">
            {!signupRole ? (
              <div className="flex flex-col gap-md py-md px-sm w-full">
                <h2 className="text-body-lg font-bold text-center text-on-surface mb-xs">How would you like to join?</h2>
                <button
                  onClick={() => setSignupRole("customer")}
                  className="h-[56px] border-[1.5px] border-primary bg-primary/5 rounded-xl font-body-md font-bold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center shadow-sm"
                >
                  I&apos;m a Shopper
                </button>
                <Link
                  href={`/seller/login?tab=signup&redirect=${encodeURIComponent(redirectPath)}`}
                  className="h-[56px] border-[1.5px] border-outline-variant bg-surface rounded-xl font-body-md font-bold text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center shadow-sm"
                >
                  I&apos;m an Artisan Seller
                </Link>
                <button
                  onClick={() => setActiveTab("signin")}
                  className="mt-sm text-sm text-primary font-medium hover:underline text-center"
                >
                  Already have an account? Sign in
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full gap-md">
                <div className="w-full flex">
                  <button
                    onClick={() => setSignupRole(null)}
                    className="text-on-surface-variant hover:text-on-surface flex items-center gap-xs font-label-xs text-label-xs font-medium"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
                    Back to role selection
                  </button>
                </div>

                {suError && (
                  <div className="w-full p-sm bg-error-container text-on-error-container rounded-lg text-sm text-center border-[0.5px] border-error/20">
                    {suError}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="flex flex-col gap-sm w-full">
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="su-name" className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Full Name
                    </label>
                    <input
                      id="su-name"
                      type="text"
                      autoComplete="name"
                      required
                      value={suName}
                      onChange={(e) => setSuName(e.target.value)}
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="su-email" className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Email
                    </label>
                    <input
                      id="su-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="su-password" className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Password
                    </label>
                    <input
                      id="su-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={suLoading}
                    className="h-[50px] w-full bg-primary text-on-primary rounded-xl font-body-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-sm shadow-sm mt-xs"
                  >
                    {suLoading ? (
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                <Divider />

                <button
                  onClick={() => handleGoogleLogin("BUYER")}
                  className="h-[50px] w-full border border-outline-variant bg-surface rounded-xl font-body-sm font-bold text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center shadow-sm gap-sm"
                >
                  <GoogleIcon />
                  Sign Up with Google
                </button>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-outline-variant/30 pt-md text-center flex flex-col gap-xs mt-xl">
          <p className="font-label-xs text-label-xs text-on-surface-variant opacity-80">Are you an artisan seller?</p>
          <Link
            href={`/seller/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-primary font-bold hover:underline font-label-xs text-label-xs"
          >
            Go to Boutique Seller Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen min-h-screen bg-background text-on-surface flex items-center justify-center font-body-md">
          <div className="animate-pulse">Loading auth configurations...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
