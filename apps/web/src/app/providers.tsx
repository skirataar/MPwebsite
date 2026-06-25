"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { syncCartWithDatabase } from "../utils/cart";
import { syncLikesWithDatabase } from "../utils/likes";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      localStorage.setItem("v-market-logged-in", "true");
      // Sync the user's cart and likes from database to localStorage
      syncCartWithDatabase();
      syncLikesWithDatabase();
    } else {
      localStorage.setItem("v-market-logged-in", "false");
    }
  }, [status, session]);

  return <>{children}</>;
}
