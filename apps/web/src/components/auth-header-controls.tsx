"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

const signInButtonClass =
  "bg-primary text-on-primary font-label-xs text-label-xs px-md py-[6px] rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm font-bold";

const signUpButtonClass =
  "border border-primary text-primary font-label-xs text-label-xs px-md py-[6px] rounded-lg hover:bg-primary/5 active:scale-95 transition-all font-bold";

export default function AuthHeaderControls() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-9 h-9 rounded-full bg-surface-variant animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-sm">
      {status === "unauthenticated" ? (
        <>
          <Link href="/login" className={signInButtonClass}>
            Sign In
          </Link>
          <Link href="/login?tab=signup" className={signUpButtonClass}>
            Sign Up
          </Link>
        </>
      ) : (
        <Link href="/profile" className="block w-9 h-9 rounded-full overflow-hidden border-[1.5px] border-primary/20 hover:border-primary transition-colors cursor-pointer">
          <img 
            src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </Link>
      )}
    </div>
  );
}
