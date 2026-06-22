"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isDark, setIsDark] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sessionRole = (session?.user as any)?.role as string | undefined;
  const accountLabel =
    sessionRole === "ADMIN"
      ? "Administrator"
      : sessionRole === "SELLER"
      ? "Artisan Seller"
      : "Customer";

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = theme === "dark" || (!theme && systemPrefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [status]);

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

  const handleLogOut = async () => {
    localStorage.setItem("v-market-logged-in", "false");
    localStorage.removeItem("v-market-account-type");
    window.dispatchEvent(new Event("login-updated"));
    window.dispatchEvent(new Event("account-type-updated"));
    await signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete account.");
        setIsDeleting(false);
        return;
      }
      // Clear local state and sign out
      localStorage.clear();
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex items-center justify-center font-body-md">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  const backHref = sessionRole === "ADMIN" ? "/admin" : "/profile";

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface antialiased flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md px-md py-sm flex items-center justify-between border-b border-outline-variant/30 max-w-lg mx-auto right-0">
        <div className="flex items-center gap-sm">
          <Link href={backHref} aria-label="Go back" className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </Link>
          <h1 className="font-body-lg text-body-lg font-medium text-on-surface">Settings</h1>
        </div>
      </header>

      <main className="flex-grow pt-[72px] pb-lg px-md max-w-lg mx-auto w-full flex flex-col justify-start gap-lg">

        {status === "authenticated" ? (
          <>
            {/* Account Info (read-only) */}
            <section className="flex flex-col gap-sm">
              <h2 className="font-body-sm text-body-sm font-semibold text-on-surface uppercase tracking-wider text-[11px] opacity-75">
                Account
              </h2>
              <div className="bg-surface rounded-xl border-[0.5px] border-outline-variant p-md flex flex-col gap-sm shadow-sm">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                      {session?.user?.name || session?.user?.email}
                    </span>
                    <span className="text-[12px] text-on-surface-variant truncate">{session?.user?.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-xs border-t border-outline-variant/20 pt-sm">
                  <span className={`material-symbols-outlined text-[16px] ${sessionRole === "SELLER" ? "text-primary" : "text-outline"}`}>
                    {sessionRole === "SELLER" ? "storefront" : "shopping_bag"}
                  </span>
                  <span className="text-[13px] text-on-surface-variant">
                    Account type: <span className="font-semibold text-on-surface">{accountLabel}</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section className="flex flex-col gap-sm">
              <h2 className="font-body-sm text-body-sm font-semibold text-on-surface uppercase tracking-wider text-[11px] opacity-75">
                Appearance
              </h2>
              <div className="bg-surface rounded-xl border-[0.5px] border-outline-variant p-md flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-base">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">Dark Mode</span>
                  <span className="text-[12px] text-on-surface-variant">Switch between dark and light templates.</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-12 h-6 rounded-full bg-outline-variant p-[2px] transition-colors relative flex items-center dark:bg-primary"
                  aria-label="Toggle dark mode"
                >
                  <div className="w-5 h-5 rounded-full bg-surface shadow-md transition-transform transform translate-x-0 flex items-center justify-center dark:translate-x-6">
                    <span className="material-symbols-outlined text-[14px] text-on-surface">
                      {isDark ? "dark_mode" : "light_mode"}
                    </span>
                  </div>
                </button>
              </div>
            </section>

            {/* Session Control */}
            <section className="flex flex-col gap-sm">
              <h2 className="font-body-sm text-body-sm font-semibold text-on-surface uppercase tracking-wider text-[11px] opacity-75">
                Session
              </h2>
              <div className="bg-surface rounded-xl border-[0.5px] border-outline-variant p-md flex flex-col gap-md shadow-sm">
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Signed in as <span className="font-bold text-on-surface">{session?.user?.email}</span>
                </p>
                <button
                  onClick={handleLogOut}
                  className="h-[44px] rounded-lg border border-outline-variant text-on-surface bg-transparent font-body-sm text-body-sm font-bold flex items-center justify-center gap-xs hover:bg-surface-container active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log Out
                </button>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="flex flex-col gap-sm mt-md pb-xl">
              <h2 className="font-body-sm text-body-sm font-semibold text-error uppercase tracking-wider text-[11px] opacity-75">
                Danger Zone
              </h2>
              <div className="bg-surface rounded-xl border-[0.5px] border-error/30 p-md flex flex-col gap-md shadow-sm">
                <div className="flex flex-col gap-xs">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">Delete Account</span>
                  <span className="text-[12px] text-on-surface-variant leading-relaxed">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </span>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => { setShowDeleteConfirm(true); setDeleteInput(""); setDeleteError(null); }}
                    className="h-[44px] rounded-lg border border-error text-error bg-transparent font-body-sm text-body-sm font-bold flex items-center justify-center gap-xs hover:bg-error/5 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                    Delete My Account
                  </button>
                ) : (
                  <div className="flex flex-col gap-sm border-t border-error/20 pt-md">
                    <p className="text-[12px] text-on-surface-variant">
                      Type <span className="font-bold text-error font-mono">DELETE</span> to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="h-[44px] px-md rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-body-sm font-mono placeholder:text-on-surface-variant/40 focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all"
                      autoFocus
                    />
                    {deleteError && (
                      <p className="text-[12px] text-error">{deleteError}</p>
                    )}
                    <div className="flex gap-sm">
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); setDeleteError(null); }}
                        className="flex-1 h-[40px] rounded-lg border border-outline-variant text-on-surface-variant font-body-sm text-body-sm font-medium hover:bg-surface-container transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteInput !== "DELETE" || isDeleting}
                        className="flex-1 h-[40px] rounded-lg bg-error text-on-error font-body-sm text-body-sm font-bold flex items-center justify-center gap-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                      >
                        {isDeleting ? (
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                            Confirm Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          /* Logged out state */
          <div className="bg-surface rounded-xl border-[0.5px] border-outline-variant p-md flex flex-col gap-md items-center text-center shadow-md mt-xl">
            <span className="material-symbols-outlined text-[48px] text-outline">lock_open</span>
            <h2 className="font-body-lg text-body-lg font-bold text-on-surface">Signed Out</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[280px] leading-relaxed">
              You are currently signed out of V-Market India. Sign in again to view your profile settings.
            </p>
            <button
              onClick={() => router.push("/login?redirect=/settings")}
              className="h-[44px] w-full max-w-[200px] bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Sign In
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
