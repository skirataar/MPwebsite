"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "../../data/products";
import { getLikes, toggleLikeProduct } from "../../utils/likes";
import { getWishlist, toggleWishlistProduct } from "../../utils/wishlist";
import { useSession } from "next-auth/react";

// Adapt a DB product to the feed's Product shape
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("liked");
  const [isMounted, setIsMounted] = useState(false);
  const [accountType, setAccountType] = useState("customer");
  const [ordersCount, setOrdersCount] = useState(0);

  // Sync account type reactively from session role
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const derivedRole = (session.user as any).role?.toLowerCase();
      setAccountType(derivedRole === "seller" ? "seller" : "customer");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrdersCount(data.orders?.length || 0);
        }
      } catch (err) {
        console.error("Failed to fetch orders count", err);
      }
    };
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

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
      // Sync Likes & Wishlist
      const likedIds = getLikes();
      const wishlistIds = getWishlist();
      try {
        const res = await fetch("/api/products?limit=100");
        if (res.ok) {
          const data = await res.json();
          const adapted: Product[] = (data.products ?? []).map(dbToFeedProduct);
          
          const filteredLikes = adapted.filter((p) => likedIds.includes(p.id));
          setLikedProducts(filteredLikes);

          const filteredWishlist = adapted.filter((p) => wishlistIds.includes(p.id));
          setWishlistProducts(filteredWishlist);

          const currentUsername = session?.user?.email ? `@${session.user.email.split("@")[0]}` : "@user";
          const filteredSeller = adapted.filter((p) => p.username === currentUsername || p.seller === session?.user?.name);
          setSellerProducts(filteredSeller);
        }
      } catch (err) {
        console.error("Failed to load products for profile view", err);
      }
    };

    if (status === "authenticated") {
      loadData();
    }

    window.addEventListener("likes-updated", loadData);
    window.addEventListener("wishlist-updated", loadData);

    return () => {
      window.removeEventListener("likes-updated", loadData);
      window.removeEventListener("wishlist-updated", loadData);
    };
  }, [status, session]);

  const handleUnlike = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleLikeProduct(productId);
  };

  const handleRemoveWishlist = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlistProduct(productId);
  };

  if (!isMounted || status === "loading") {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex items-center justify-center font-body-md">
        <div className="animate-pulse">Loading profile details...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex items-center justify-center font-body-md">
        <div className="animate-pulse">Redirecting to login portal...</div>
      </div>
    );
  }

  const displayName = session?.user?.name || "Artisan Shopper";
  const username = session?.user?.email ? `@${session.user.email.split("@")[0]}` : "@user";
  const avatar = session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";

  return (
    <div className="w-screen min-h-screen bg-background text-on-surface antialiased flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* 1. Header (Sticky App Bar) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md px-md py-sm flex items-center justify-between border-b border-outline-variant/30 max-w-lg mx-auto right-0">
        <div className="flex items-center gap-sm">
          <Link href="/" aria-label="Go back" className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </Link>
          <h1 className="font-body-lg text-body-lg font-medium text-on-surface">Profile</h1>
        </div>
        <div className="flex items-center gap-md">
          {/* Settings gear link */}
          <Link 
            href="/settings"
            className="p-xs text-on-surface hover:opacity-80 transition-opacity flex items-center justify-center"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </header>

      {/* 2. Main Profile Content Canvas */}
      <main className="flex-grow pt-[72px] pb-lg px-md max-w-lg mx-auto w-full flex flex-col justify-start gap-lg">
        
        {/* Profile Card Info Header */}
        <section className="bg-surface rounded-xl border-[0.5px] border-outline-variant p-md flex items-center gap-md shadow-sm">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-outline-variant bg-surface-variant flex-shrink-0">
            <img 
              alt="User profile avatar" 
              className="w-full h-full object-cover" 
              src={avatar}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-grow flex flex-col">
            <div className="flex items-center gap-sm flex-wrap">
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface leading-tight">
                {displayName}
              </h2>
              <span className="bg-primary/10 text-primary font-label-xs text-[10px] px-sm py-[2px] rounded-full font-bold capitalize border border-primary/20">
                {accountType}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate max-w-[200px]">
              {username}
            </p>
            
            <div className="flex items-center gap-sm mt-sm border-t border-outline-variant/20 pt-xs flex-wrap justify-between w-full">
              <div className="flex flex-col items-center">
                <span className="font-price-md text-price-md font-bold text-on-surface">
                  {likedProducts.length}
                </span>
                <span className="font-label-xs text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Likes
                </span>
              </div>
              <div className="w-[1px] h-6 bg-outline-variant/30"></div>
              <div className="flex flex-col items-center">
                <span className="font-price-md text-price-md font-bold text-on-surface">
                  {wishlistProducts.length}
                </span>
                <span className="font-label-xs text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Wishlist
                </span>
              </div>
              <div className="w-[1px] h-6 bg-outline-variant/30"></div>
              <Link href="/orders?from=profile" className="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer">
                <span className="font-price-md text-price-md font-bold text-on-surface">
                  {ordersCount}
                </span>
                <span className="font-label-xs text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Orders
                </span>
              </Link>
              <div className="w-[1px] h-6 bg-outline-variant/30"></div>
              <div className="flex flex-col items-center">
                <span className="font-price-md text-price-md font-bold text-on-surface">
                  {accountType === "seller" ? sellerProducts.length : 0}
                </span>
                <span className="font-label-xs text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Items
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Controls Navigation */}
        <section className="border-b border-outline-variant/40 flex">
          <button 
            onClick={() => setActiveTab("liked")}
            className={`flex-1 text-center py-sm font-label-xs text-label-xs border-b-2 transition-all font-semibold ${
              activeTab === "liked"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Liked Videos
          </button>
          <button 
            onClick={() => setActiveTab("wishlist")}
            className={`flex-1 text-center py-sm font-label-xs text-label-xs border-b-2 transition-all font-semibold ${
              activeTab === "wishlist"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Wishlist
          </button>
          {accountType === "seller" && (
            <button 
              onClick={() => setActiveTab("boutique")}
              className={`flex-1 text-center py-sm font-label-xs text-label-xs border-b-2 transition-all font-semibold ${
                activeTab === "boutique"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              My Boutique
            </button>
          )}
          <Link 
            href="/settings"
            className="flex-1 text-center py-sm font-label-xs text-label-xs border-b-2 border-transparent text-on-surface-variant hover:text-on-surface flex items-center justify-center font-semibold"
          >
            Settings
          </Link>
        </section>

        {/* Tab Content Rendering */}
        <section className="flex-grow flex flex-col justify-start">
          {activeTab === "wishlist" && (
            wishlistProducts.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex flex-col items-center justify-center py-huge px-xl text-center my-auto">
                <span className="material-symbols-outlined text-[64px] text-outline-variant mb-md" data-icon="favorite_border">
                  favorite_border
                </span>
                <h2 className="font-body-lg text-body-lg font-medium text-on-surface mb-xs">Your wishlist is empty</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg leading-relaxed max-w-xs">
                  Save your favorite handcrafted creations to your wishlist to buy them later or keep track of stock.
                </p>
                <Link 
                  href="/"
                  className="h-xxl px-lg border border-primary text-primary bg-transparent rounded-lg font-body-md text-body-md hover:bg-primary-container/10 transition-colors flex items-center justify-center active:scale-95"
                >
                  Browse home feed
                </Link>
              </div>
            ) : (
              /* WISHLIST PRODUCTS GRID */
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
                        {/* Remove from Wishlist Button */}
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
            )
          )}

          {activeTab === "liked" && (
            likedProducts.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex flex-col items-center justify-center py-huge px-xl text-center my-auto">
                <span className="material-symbols-outlined text-[64px] text-outline-variant mb-md" data-icon="favorite_border">
                  favorite_border
                </span>
                <h2 className="font-body-lg text-body-lg font-medium text-on-surface mb-xs">No liked videos yet</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg leading-relaxed max-w-xs">
                  Discover unique creations from local artisan sellers. Double tap or click the heart button to save your favorites.
                </p>
                <Link 
                  href="/"
                  className="h-xxl px-lg border border-primary text-primary bg-transparent rounded-lg font-body-md text-body-md hover:bg-primary-container/10 transition-colors flex items-center justify-center active:scale-95"
                >
                  Browse home feed
                </Link>
              </div>
            ) : (
              /* LIKED VIDEOS GRID */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
                {likedProducts.map((product) => (
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
                      {product.discount && (
                        <span className="absolute top-xs left-xs bg-primary text-on-primary font-label-xs text-[9px] px-sm py-[2px] rounded-full font-medium">
                          {product.discount}
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
                        {/* Unlike Button Option */}
                        <button
                          onClick={(e) => handleUnlike(product.id, e)}
                          className="p-xs text-primary hover:opacity-80 transition-opacity flex items-center justify-center rounded-full bg-primary-container/10 active:scale-90"
                          aria-label="Unlike product"
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
            )
          )}

          {activeTab === "boutique" && (
            accountType === "seller" ? (
              /* SELLER BOUTIQUE PRODUCTS GRID */
              <div className="flex flex-col gap-md">
                <div className="flex items-center justify-between flex-wrap gap-sm">
                  <h3 className="font-body-sm text-body-sm font-semibold text-on-surface">Your Listed Products</h3>
                  <Link 
                    href="/seller/dashboard"
                    className="flex items-center gap-xs font-label-xs text-label-xs text-primary font-bold hover:underline bg-primary/5 px-sm py-[4px] rounded-md transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[14px]">dashboard</span> Seller Dashboard
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
                  {sellerProducts.length === 0 ? (
                    <div className="col-span-full py-xl text-center italic text-on-surface-variant font-body-sm">
                      You haven't listed any crafts yet.
                    </div>
                  ) : (
                    sellerProducts.map((product) => (
                      <div 
                        key={product.id}
                        className="group flex flex-col bg-surface rounded-xl border-[0.5px] border-outline-variant overflow-hidden hover:shadow-md transition-shadow relative"
                      >
                        <div className="aspect-[3/4] bg-surface-variant overflow-hidden relative">
                          <img 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                            src={product.productThumb}
                          />
                        </div>
                        <div className="p-sm flex flex-col gap-xs min-h-[92px] justify-between">
                          <div className="flex flex-col">
                            <span className="font-body-sm text-[13px] font-semibold text-on-surface line-clamp-1 leading-tight">
                              {product.title}
                            </span>
                            <span className="font-label-xs text-[10px] text-on-surface-variant mt-0.5">
                              {product.location}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-xs border-t border-outline-variant/10 pt-xs">
                            <span className="font-price-md text-price-md text-primary font-bold">
                              ₹{product.price.toLocaleString()}
                            </span>
                            <button 
                              onClick={() => alert("Edit product details drawer...")}
                              className="p-xs text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center active:scale-90"
                              aria-label="Edit craft"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* CUSTOMER WARNING */
              <div className="flex flex-col items-center justify-center py-huge px-xl text-center bg-surface-container-low border border-outline-variant/30 rounded-xl">
                <span className="material-symbols-outlined text-[48px] text-outline mb-sm" data-icon="storefront">
                  storefront
                </span>
                <h3 className="font-body-md text-body-md font-semibold text-on-surface mb-xs">Boutique Disabled</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-md max-w-[280px] leading-relaxed">
                  Only Seller accounts can host digital boutiques. Switch your account type to Seller in Settings to showcase your craftsmanship.
                </p>
                <Link 
                  href="/settings"
                  className="h-xl px-md bg-primary text-on-primary rounded-lg font-label-xs text-label-xs font-bold hover:opacity-90 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                >
                  Go to Settings
                </Link>
              </div>
            )
          )}
        </section>

      </main>

    </div>
  );
}
