"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCart, updateCartItemQuantity, removeFromCart, CartItem, syncCartWithDatabase } from "../../utils/cart";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDark, setIsDark] = useState(false);

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

    // Load dynamic cart items on client mount
    setCartItems(getCart());
    syncCartWithDatabase();

    const syncCart = () => {
      setCartItems(getCart());
    };

    window.addEventListener("cart-updated", syncCart);
    return () => {
      window.removeEventListener("cart-updated", syncCart);
    };
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

  const updateQuantity = (id: string, delta: number) => {
    updateCartItemQuantity(id, delta);
  };

  const removeItem = (id: string) => {
    removeFromCart(id);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const checkoutFee = cartItems.length > 0 ? 29 : 0;
  const total = subtotal + checkoutFee;

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });
      if (res.ok) {
        alert("Checkout successful! Your orders have been placed.");
        // Clear local storage cart
        localStorage.removeItem("v-market-cart");
        window.dispatchEvent(new Event("cart-updated"));
        router.push("/orders");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface antialiased flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md px-md py-sm flex items-center justify-between border-b border-outline-variant/30 max-w-lg mx-auto right-0">
        <div className="flex items-center gap-sm">
          <Link href="/" aria-label="Go back" className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </Link>
          <h1 className="font-body-lg text-body-lg font-medium text-on-surface">Your cart</h1>
        </div>
        <div className="flex items-center gap-md">
          {/* Dark Mode toggle button */}
          <button 
            onClick={toggleTheme}
            className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center justify-center"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isDark ? "'FILL' 1" : "'FILL' 0" }}>
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <button 
            onClick={() => alert("Cart Help: If you have any payment or item issues, please contact Razorpay buyer support.")}
            aria-label="Help" 
            className="p-xs text-on-surface hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-[72px] pb-[130px] px-md max-w-lg mx-auto w-full flex flex-col justify-start">
        {cartItems.length === 0 ? (
          /* EMPTY STATE VERSION */
          <div className="flex flex-col items-center justify-center py-huge px-xl text-center my-auto">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-md" data-icon="shopping_bag">
              shopping_bag
            </span>
            <h2 className="font-body-lg text-body-lg font-medium text-on-surface mb-xs">Nothing here yet</h2>
            <p className="font-body-sm text-body-sm text-secondary mb-lg leading-relaxed">
              Your cart is feeling a little light. Discover unique products from local artisan sellers.
            </p>
            <Link 
              href="/"
              className="h-xxl px-lg border border-primary text-primary bg-transparent rounded-lg font-body-md text-body-md hover:bg-primary-container/10 transition-colors flex items-center justify-center"
            >
              Explore feed
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex flex-col gap-md">
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-surface rounded-xl border-[0.5px] border-outline-variant p-sm flex gap-sm items-start shadow-sm"
                >
                  <img 
                    alt={item.title} 
                    className="w-[72px] h-[72px] object-cover rounded-lg flex-shrink-0 border border-outline-variant/35" 
                    src={item.image}
                    data-alt={item.dataAlt}
                  />
                  <div className="flex-grow flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-sm">
                      <div className="min-w-0">
                        <h2 className="font-body-sm text-body-sm font-medium text-on-surface line-clamp-2 truncate">
                          {item.title}
                        </h2>
                        <p className="font-label-xs text-label-xs text-secondary mt-base">
                          {item.shop}
                        </p>
                      </div>
                      <p className="font-price-md text-price-md text-primary flex-shrink-0 mt-base font-bold">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-md">
                      <div className="flex items-center h-xl border-[0.5px] border-outline-variant rounded-full bg-surface-container-lowest">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity" 
                          className="w-xl h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors rounded-l-full active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[16px]" data-icon="remove">remove</span>
                        </button>
                        <span className="font-body-sm text-body-sm w-lg text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity" 
                          className="w-xl h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors rounded-r-full active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[16px]" data-icon="add">add</span>
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item" 
                        className="p-xs text-error hover:opacity-80 transition-opacity active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[20px]" data-icon="delete_outline">
                          delete_outline
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Card */}
            <div className="mt-lg bg-surface rounded-xl border-[0.5px] border-outline-variant p-md shadow-sm">
              <h3 className="font-body-sm text-body-sm font-medium text-on-surface mb-md border-b border-outline-variant/20 pb-xs">
                Order Summary
              </h3>
              <div className="flex justify-between items-center mb-sm">
                <span className="font-body-sm text-body-sm text-secondary">
                  Subtotal ({cartItems.reduce((acc, x) => acc + x.quantity, 0)} items)
                </span>
                <span className="font-price-md text-price-md text-on-surface font-semibold">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-sm">
                <span className="font-body-sm text-body-sm text-secondary">Safe checkout fee</span>
                <span className="font-price-md text-price-md text-on-surface font-semibold">₹{checkoutFee}</span>
              </div>
              <hr className="border-t-[0.5px] border-outline-variant/40 my-sm"/>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md font-medium text-on-surface">Total</span>
                <span className="font-price-lg text-price-lg font-bold text-primary">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-md flex items-center justify-center gap-xs text-secondary opacity-80">
              <span className="material-symbols-outlined text-[14px]" data-icon="lock">lock</span>
              <span className="font-label-xs text-label-xs">Payments secured by Razorpay</span>
            </div>
          </>
        )}
      </main>

      {/* Bottom Action Bar (Fixed) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-surface border-t-[0.5px] border-outline-variant p-md pb-xl z-50 max-w-lg mx-auto shadow-lg">
          <button 
            onClick={handleCheckout}
            className="w-full h-xxl bg-primary text-on-primary rounded-lg font-body-md text-body-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-sm shadow-sm active:scale-[0.98] duration-200"
          >
            Proceed to pay ₹{total.toLocaleString()}
          </button>
        </div>
      )}
      
    </div>
  );
}
