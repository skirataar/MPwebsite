"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { syncCartWithDatabase } from "../utils/cart";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      localStorage.setItem("v-market-logged-in", "true");
      // Sync the user's cart from database to localStorage
      syncCartWithDatabase();
    } else {
      localStorage.setItem("v-market-logged-in", "false");
    }
  }, [status, session]);

  return <>{children}</>;
}
