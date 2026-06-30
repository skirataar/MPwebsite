"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "../../data/products";
import { getWishlist, toggleWishlistProduct } from "../../utils/wishlist";
import { useSession } from "next-auth/react";

// Adapter to transform products from DB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToFeedProduct(p: any): Product {
  return {
    id: p._id,
    title: p.title,
    category: p.category,
    description: p.description,
    price: p.price,
    originalPrice: p.mrp,
    seller: p.sellerId?.name || "Artisan",
    username: `@${p.sellerId?.username || "artisan"}`,
    location: p.sellerId?.location || "India",
    likes: p.likesCount ?? 0,
    avatar: p.sellerId?.avatarUrl || "https://ui-avatars.com/api/?name=Artisan&background=random",
    videoBg: p.imageUrl,
    videoUrl: p.videoUrl || undefined,
    productThumb: p.imageUrl,
    dataAlt: p.title,
    stockLeft: p.stock,
    rating: 4.8,
    reviewsCount: 0,
    viewsCount: `${p.viewsCount ?? 0} views`,
    freeDelivery: true,
  };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Theme Sync
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = theme === "dark" || (!theme && systemPrefersDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const loadData = async () => {
      const wishlistIds = getWishlist();
      try {
        const res = await fetch("/api/products?limit=100");
        if (res.ok) {
          const data = await res.json();
          const adapted: Product[] = (data.products ?? []).map(dbToFeedProduct);
          const filteredWishlist = adapted.filter((p) => wishlistIds.includes(p.id));
          setWishlistProducts(filteredWishlist);
        }
      } catch (err) {
        console.error("Failed to load products for wishlist page", err);
      }
    };

    if (status === "authenticated") {
      loadData();
    }

    window.addEventListener("wishlist-updated", loadData);

    return () => {
      window.removeEventListener("wishlist-updated", loadData);
    };
  }, [status]);

  const handleRemoveWishlist = async (productId: number | string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlistProduct(productId);
  };

  if (!isMounted || status === "loading") {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex items-center justify-center font-body-md">
        <div className="animate-pulse">Loading wishlist...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-md text-center font-body-md">
        <span className="material-symbols-outlined text-[64px] text-outline mb-md">lock</span>
        <h2 className="font-headline-md text-headline-md font-semibold mb-sm">Sign in required</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg max-w-sm">
          Please sign in to view and manage your wishlist.
        </p>
        <Link
          href="/login?redirect=/wishlist"
          className="h-xxl px-lg bg-primary text-on-primary rounded-lg font-body-md text-body-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center active:scale-95 shadow-md"
        >
          Sign In to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface antialiased flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md px-md py-sm flex items-center justify-between border-b border-outline-variant/30 max-w-lg mx-auto right-0">
        <div className="flex items-center gap-sm">
          <Link href="/profile" aria-label="Go back to profile" className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </Link>
          <h1 className="font-body-lg text-body-lg font-medium text-on-surface">My Wishlist</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-[72px] pb-lg px-md max-w-lg mx-auto w-full flex flex-col justify-start gap-lg">
        {wishlistProducts.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-huge px-xl text-center my-auto">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-md" data-icon="favorite_border">
              favorite_border
            </span>
            <h2 className="font-body-lg text-body-lg font-medium text-on-surface mb-xs">Your wishlist is empty</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg leading-relaxed max-w-xs">
              Explore our marketplace and add beautiful artisan products to your wishlist.
            </p>
            <Link 
              href="/"
              className="h-xxl px-lg border border-primary text-primary bg-transparent rounded-lg font-body-md text-body-md hover:bg-primary-container/10 transition-colors flex items-center justify-center active:scale-95"
            >
              Browse home feed
            </Link>
          </div>
        ) : (
          /* GRID OF PRODUCTS */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
            {wishlistProducts.map((product) => (
              <Link 
                href={`/product/${product.id}`}
                key={product.id}
                className="group flex flex-col bg-surface rounded-xl border-[0.5px] border-outline-variant overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer"
              >
                {/* Image Area */}
                <div className="aspect-[3/4] bg-surface-variant overflow-hidden relative">
                  <img 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={product.productThumb}
                  />
                  {/* Badge overlay */}
                  {product.stockLeft !== undefined && product.stockLeft <= 5 && (
                    <span className="absolute top-xs left-xs bg-amber-500 text-white font-label-xs text-[9px] px-sm py-[2px] rounded-full font-medium">
                      Only {product.stockLeft} left
                    </span>
                  )}
                </div>
                {/* Content Details Area */}
                <div className="p-sm flex flex-col gap-xs min-h-[92px] justify-between">
                  <div className="flex flex-col">
                    <span className="font-body-sm text-[13px] font-semibold text-on-surface line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                      {product.title}
                    </span>
                    <span className="font-label-xs text-[10px] text-on-surface-variant mt-0.5">
                      by {product.seller}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-xs border-t border-outline-variant/10 pt-xs">
                    <span className="font-price-md text-price-md text-primary font-bold">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {/* Remove button */}
                    <button
                      onClick={(e) => handleRemoveWishlist(product.id, e)}
                      className="p-xs text-rose-500 hover:opacity-80 transition-opacity flex items-center justify-center rounded-full bg-rose-500/10 active:scale-90"
                      aria-label="Remove from wishlist"
                      title="Remove from Wishlist"
                    >
                      <span className="material-symbols-outlined text-[16px] text-fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                        favorite
                      </span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
