"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function AuthSyncContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();

  const role = searchParams?.get("role") || "BUYER";
  const redirect = searchParams?.get("redirect") || (role === "SELLER" ? "/seller/dashboard" : "/");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(role === "SELLER" ? "/seller/login" : "/login");
      return;
    }

    const syncUser = async () => {
      try {
        await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        });

        // Force NextAuth to update the client session JWT with the new role
        await update({ role });


        localStorage.setItem("v-market-logged-in", "true");
        localStorage.setItem("v-market-account-type", role === "SELLER" ? "seller" : "customer");
        if (session?.user?.name) {
          localStorage.setItem("v-market-display-name", session.user.name);
        }
        window.dispatchEvent(new Event("login-updated"));
        window.dispatchEvent(new Event("account-type-updated"));
      } catch (error) {
        console.error("Failed to sync user:", error);
      } finally {
        router.push(redirect);
      }
    };

    syncUser();
  }, [status, role, redirect, router, session, update]);

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface flex flex-col items-center justify-center font-body-md">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="animate-pulse">Setting up your account...</p>
    </div>
  );
}

export default function AuthSyncPage() {
  return (
    <Suspense fallback={
      <div className="w-screen min-h-screen bg-background text-on-surface flex items-center justify-center font-body-md">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <AuthSyncContent />
    </Suspense>
  );
}
