"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface DBOrder {
  _id: string;
  productId: {
    _id: string;
    title: string;
    imageUrl: string;
    price: number;
    sellerId?: {
      name: string;
      username: string;
    };
  } | null;
  amount: number;
  quantity: number;
  status: string;
  razorpayOrderId?: string;
  createdAt: string;
}

export default function MyOrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [backHref, setBackHref] = useState("/");

  useEffect(() => {
    // Sync theme
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
      if (params.get("from") === "profile") {
        setBackHref("/profile");
      } else {
        setBackHref("/");
      }
    }

    if (status === "unauthenticated") {
      router.push("/login?redirect=/orders");
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

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

  if (status === "loading" || loading) {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex items-center justify-center font-body-md">
        <div className="animate-pulse flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-[48px] animate-spin">sync</span>
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface antialiased flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md px-md py-sm flex items-center justify-between border-b border-outline-variant/30 max-w-lg mx-auto right-0">
        <div className="flex items-center gap-sm">
          <Link href={backHref} aria-label="Go back" className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </Link>
          <h1 className="font-body-lg text-body-lg font-medium text-on-surface">My Orders</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-[72px] pb-lg px-md max-w-lg mx-auto w-full flex flex-col justify-start">
        {orders.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-huge px-xl text-center my-auto">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-md" data-icon="receipt_long">
              receipt_long
            </span>
            <h2 className="font-body-lg text-body-lg font-medium text-on-surface mb-xs">No orders placed</h2>
            <p className="font-body-sm text-body-sm text-secondary mb-lg leading-relaxed">
              Looks like you haven&apos;t ordered any artisan crafts yet. Discover unique creations from our home feed.
            </p>
            <Link 
              href="/"
              className="h-xxl px-lg border border-primary text-primary bg-transparent rounded-lg font-body-md text-body-md hover:bg-primary-container/10 transition-colors flex items-center justify-center active:scale-95"
            >
              Browse home feed
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {orders.map((order) => {
              const product = order.productId || {
                title: "Deleted Product",
                imageUrl: "https://ui-avatars.com/api/?name=Product&background=random",
                price: order.amount / order.quantity,
                sellerId: { name: "Artisan Shop", username: "artisan" }
              };
              const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const sellerName = product.sellerId?.name || "Artisan Shop";

              return (
                <div 
                  key={order._id}
                  className="bg-surface rounded-xl border-[0.5px] border-outline-variant p-sm flex flex-col gap-sm shadow-sm"
                >
                  <div className="flex gap-sm items-start">
                    <img 
                      alt={product.title} 
                      className="w-[72px] h-[72px] object-cover rounded-lg flex-shrink-0 border border-outline-variant/35" 
                      src={product.imageUrl}
                    />
                    <div className="flex-grow flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-sm">
                        <div className="min-w-0">
                          <h2 className="font-body-sm text-body-sm font-semibold text-on-surface line-clamp-2">
                            {product.title}
                          </h2>
                          <p className="font-label-xs text-label-xs text-secondary mt-0.5">
                            by {sellerName}
                          </p>
                        </div>
                        <p className="font-price-md text-price-md text-primary flex-shrink-0 font-bold">
                          ₹{order.amount.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-sm mt-sm">
                        <span className="font-label-xs text-label-xs text-on-surface-variant">
                          Qty: {order.quantity}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                        <span className="font-label-xs text-label-xs text-on-surface-variant">
                          Ordered on {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-t-[0.5px] border-outline-variant/30" />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-xs">
                      <span className={`w-2 h-2 rounded-full ${
                        order.status === 'PAID' || order.status === 'ESCROW_RELEASED' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                      }`}></span>
                      <span className="font-label-xs text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        {order.status === 'PAID' ? 'PAID & CONFIRMED' : order.status}
                      </span>
                    </div>

                    <button 
                      onClick={() => alert(`Tracking info for order reference: ${order.razorpayOrderId || order._id}\nStatus: Shipment in transit.`)}
                      className="h-xl px-md border border-outline-variant hover:bg-surface-variant rounded-full font-label-xs text-label-xs text-on-surface transition-colors active:scale-95 flex items-center justify-center font-semibold"
                    >
                      Track Shipment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
