"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { PRODUCTS as STATIC_VIDEOS, Product } from "../data/products";
import { getCartCount, addToCart, syncCartWithDatabase } from "../utils/cart";
import { getLikes, toggleLikeProduct } from "../utils/likes";
import AuthHeaderControls from "../components/auth-header-controls";

// Adapt a DB product to the feed's Product shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToFeedProduct(p: any): Product {
  return {
    id: p._id, // use actual string ID from MongoDB
    title: p.title,
    category: p.category,
    description: p.description,
    price: p.price,
    originalPrice: p.mrp,
    seller: p.sellerId?.name || "Artisan",
    username: `@${p.sellerId?.username || "artisan"}`,
    location: "India",
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

const SIDEBAR_CATEGORIES = [
  { id: "all", name: "All", icon: "apps" },
  { id: "fashion", name: "Fashion", icon: "checkroom" },
  { id: "handmade", name: "Handmade", icon: "glass" },
  { id: "food", name: "Food & Drinks", icon: "restaurant" },
  { id: "home-decor", name: "Home Decor", icon: "chair" },
  { id: "beauty", name: "Beauty", icon: "spa" },
  { id: "electronics", name: "Electronics", icon: "devices" },
  { id: "stationery", name: "Stationery", icon: "edit" },
  { id: "toys", name: "Toys", icon: "toys" },
  { id: "sports", name: "Sports", icon: "sports_soccer" },
];

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [accountType, setAccountType] = useState("customer");

  // Sync account type reactively from session role
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const derivedRole = (session.user as any).role?.toLowerCase();
      setAccountType(derivedRole === "seller" ? "seller" : "customer");
    }
  }, [status, session]);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = theme === "dark" || (!theme && systemPrefersDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Swipe gesture and wheel scroll states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lastWheelTime = useRef<number>(0);
  const videoRefs = useRef<Record<string | number, HTMLVideoElement | null>>({});

  useEffect(() => {
    // Initial load from localStorage
    setCartCount(getCartCount());
    syncCartWithDatabase();

    // Sync likes on mount
    const initialLikes = getLikes();
    const likesMap: Record<string | number, boolean> = {};
    initialLikes.forEach(id => {
      likesMap[id] = true;
    });
    setLikedVideos(likesMap);

    // Listen to updates from other pages
    const syncCart = () => {
      setCartCount(getCartCount());
    };

    const syncLikes = () => {
      const currentLikes = getLikes();
      const newMap: Record<string | number, boolean> = {};
      currentLikes.forEach(id => {
        newMap[id] = true;
      });
      setLikedVideos(newMap);
    };

    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("likes-updated", syncLikes);
    return () => {
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("likes-updated", syncLikes);
    };
  }, []);
  const [likedVideos, setLikedVideos] = useState<Record<string | number, boolean>>({});
  const [followedSellers, setFollowedSellers] = useState<Record<string, boolean>>({});
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(false);

  // DB products state
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  // Fetch live DB products
  const fetchDbProducts = useCallback(async () => {
    try {
      const url = "/api/products?limit=50";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setDbProducts((data.products ?? []).map(dbToFeedProduct));
    } catch {
      // silently fail — static data still shows
    }
  }, []);

  useEffect(() => {
    fetchDbProducts();
  }, [fetchDbProducts]);

  // Merge: DB products first, then static
  const allVideos = [
    ...dbProducts,
    ...STATIC_VIDEOS,
  ];

  // Sort the merged list based on active category (selected category first)
  const filteredVideos = React.useMemo(() => {
    if (activeCategoryFilter === "all") {
      return allVideos;
    }
    const matching = allVideos.filter((v) => v.category === activeCategoryFilter);
    const nonMatching = allVideos.filter((v) => v.category !== activeCategoryFilter);
    return [...matching, ...nonMatching];
  }, [allVideos, activeCategoryFilter]);

  useEffect(() => {
    filteredVideos.forEach((video, idx) => {
      const el = videoRefs.current[video.id];
      if (el) {
        if (idx === activeVideoIdx) {
          el.currentTime = 0;
          el.play().catch((err) => {
            console.log("Auto-play failed:", err);
          });
        } else {
          el.pause();
        }
      }
    });
  }, [activeVideoIdx, filteredVideos]);

  // Ensure active video index is bound to the filtered video list bounds
  const getActiveVideo = () => {
    if (filteredVideos.length === 0) return STATIC_VIDEOS[0]; // fallback
    const video = filteredVideos[activeVideoIdx % filteredVideos.length];
    return video || filteredVideos[0];
  };

  const activeVideo = getActiveVideo();

  const handleNextVideo = () => {
    if (filteredVideos.length <= 1) return;
    setActiveVideoIdx((prev) => (prev + 1) % filteredVideos.length);
  };

  const handlePrevVideo = () => {
    if (filteredVideos.length <= 1) return;
    setActiveVideoIdx((prev) => (prev - 1 + filteredVideos.length) % filteredVideos.length);
  };

  const handleSelectCategory = (catId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryFilter(catId);
    setActiveVideoIdx(0); // reset index
    setIsCategorySidebarOpen(false); // close sidebar drawer
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      router.push("/login?redirect=/");
      return;
    }
    const liked = toggleLikeProduct(activeVideo.id);
    setLikedVideos((prev) => ({
      ...prev,
      [activeVideo.id]: liked,
    }));
  };

  const toggleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    setFollowedSellers((prev) => ({
      ...prev,
      [activeVideo.username]: !prev[activeVideo.username],
    }));
  };

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!isSignedIn) {
      router.push("/login?redirect=/");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: activeVideo.id, quantity: 1 }),
      });
      if (res.ok) {
        alert(`Order placed successfully for ${activeVideo.title}!`);
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

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      router.push("/login?redirect=/");
      return;
    }
    addToCart(activeVideo);
    
    // Flying cart animation
    const cartBtn = document.getElementById("cart-icon-header");
    if (cartBtn) {
      const cartRect = cartBtn.getBoundingClientRect();
      const rect = e.currentTarget.getBoundingClientRect();
      
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;
      
      const el = document.createElement("img");
      el.src = activeVideo.productThumb;
      el.className = "fixed z-50 pointer-events-none rounded-full border border-primary object-cover shadow-lg";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.left = `${startX - 20}px`;
      el.style.top = `${startY - 20}px`;
      el.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
      document.body.appendChild(el);
      
      requestAnimationFrame(() => {
        el.style.left = `${endX - 20}px`;
        el.style.top = `${endY - 20}px`;
        el.style.transform = "scale(0.1) rotate(360deg)";
        el.style.opacity = "0.1";
      });
      
      setTimeout(() => {
        el.remove();
      }, 800);
    }
  };

  // Touch gesture swipe controls for cycling videos
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const diffY = touchStart - touchEnd;
    const minSwipeDistance = 50; // px

    if (diffY > minSwipeDistance) {
      // Swipe Up -> Next Video
      handleNextVideo();
    } else if (diffY < -minSwipeDistance) {
      // Swipe Down -> Prev Video
      handlePrevVideo();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Desktop mouse scroll wheel cycling
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 15) return;
    
    const now = Date.now();
    if (now - lastWheelTime.current < 800) return;
    lastWheelTime.current = now;

    if (e.deltaY > 0) {
      handleNextVideo();
    } else {
      handlePrevVideo();
    }
  };

  const isLiked = !!likedVideos[activeVideo.id];
  const currentLikesCount = isLiked ? activeVideo.likes + 1 : activeVideo.likes;
  const isFollowed = !!followedSellers[activeVideo.username];

  // Up Next Queue of filtered videos
  const nextUpVideos = filteredVideos.filter((v) => v.id !== activeVideo.id);

  return (
    <div className="w-screen h-screen overflow-hidden bg-surface text-on-surface flex flex-col font-body-md antialiased select-none">
      
      {/* Dynamic Sidebar Animation Keyframes */}
      <style>{`
        .sidebar-overlay {
            background-color: rgba(0, 0, 0, 0.5);
            animation: fadeIn 300ms ease-in-out forwards;
        }
        
        .sidebar-panel {
            transform: translateX(-100%);
            animation: slideIn 300ms ease-out forwards;
        }

        .stagger-item {
            opacity: 0;
            transform: translateX(-10px);
            animation: slideFadeIn 300ms ease-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }

        @keyframes slideFadeIn {
            from {
                opacity: 0;
                transform: translateX(-10px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
      `}</style>

      {/* 1. SHARED TOP NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-30 flex justify-between items-center px-md py-sm bg-transparent text-primary dark:text-primary-fixed-dim">
        <div className="font-headline-md text-headline-md font-bold tracking-tight">
          V-Market India
        </div>
        <div className="flex items-center gap-md">
          <Link 
            href={isSignedIn ? "/cart" : "/sign-in?redirect_url=/cart"}
            id="cart-icon-header"
            className="text-primary dark:text-primary-fixed-dim hover:opacity-80 transition-opacity relative flex items-center"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-surface">
                {cartCount}
              </span>
            )}
          </Link>
          <AuthHeaderControls />
        </div>
      </header>

      {/* 2. MAIN GRID LAYOUT */}
      <main className="flex-1 flex w-full h-full pt-[64px] pb-[72px] md:pb-0 px-md md:px-lg gap-lg max-w-[1280px] mx-auto items-center justify-center relative">
        
        {/* Left Sidebar (Desktop Only) */}
        <aside className="hidden md:flex flex-col w-64 h-full py-xl gap-xl justify-center z-10 opacity-70 hover:opacity-100 transition-opacity">
          <div className="flex flex-col gap-sm">
            <button 
              onClick={() => {
                setActiveCategoryFilter("all");
                setActiveVideoIdx(0);
              }}
              className={`flex items-center gap-md rounded-lg px-md py-sm font-label-xs text-label-xs transition-transform duration-300 ease-in-out hover:scale-95 ${
                activeCategoryFilter === "all" 
                  ? "bg-primary-container text-on-primary-container" 
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              Home Feed
            </button>
            <button 
              onClick={() => setIsCategorySidebarOpen(true)}
              className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container px-md py-sm rounded-lg font-label-xs text-label-xs transition-transform duration-300 ease-in-out hover:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>grid_view</span>
              Categories
            </button>
            {isSignedIn && accountType === "seller" && (
              <Link 
                href="/seller/dashboard"
                className="flex items-center gap-md text-primary font-bold hover:bg-primary/5 px-md py-sm rounded-lg font-label-xs text-label-xs transition-transform duration-300 ease-in-out hover:scale-95"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>dashboard</span>
                Seller Dashboard
              </Link>
            )}
            {isSignedIn && (session?.user as any)?.role === "ADMIN" && (
              <Link 
                href="/admin"
                className="flex items-center gap-md text-primary font-bold hover:bg-primary/5 px-md py-sm rounded-lg font-label-xs text-label-xs transition-transform duration-300 ease-in-out hover:scale-95"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>admin_panel_settings</span>
                Admin Panel
              </Link>
            )}
            <Link 
              href="/profile"
              className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container px-md py-sm rounded-lg font-label-xs text-label-xs transition-transform duration-300 ease-in-out hover:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
              My Profile
            </Link>
            <Link 
              href="/settings"
              className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container px-md py-sm rounded-lg font-label-xs text-label-xs transition-transform duration-300 ease-in-out hover:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>settings</span>
              Settings
            </Link>
          </div>
        </aside>

        {/* Center: Main Video Player Frame */}
        <section 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="relative w-full max-w-[480px] h-[calc(100vh-160px)] md:h-[calc(100vh-100px)] bg-surface-variant rounded-xl border-[0.5px] border-outline-variant overflow-hidden flex-shrink-0 flex flex-col group shadow-lg z-10 touch-none select-none"
        >
          
          {/* Vertical Video sliding container */}
          <div 
            className="absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out flex flex-col"
            style={{ transform: `translateY(-${activeVideoIdx * 100}%)` }}
          >
            {filteredVideos.map((video) => (
              <div 
                key={video.id} 
                className="w-full h-full flex-shrink-0 relative bg-black flex items-center justify-center overflow-hidden"
              >
                {video.videoUrl ? (
                  <video
                    ref={(el) => { videoRefs.current[video.id] = el; }}
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    onClick={(e) => {
                      const videoEl = e.currentTarget;
                      if (videoEl.paused) {
                        videoEl.play().catch(() => {});
                      } else {
                        videoEl.pause();
                      }
                    }}
                  />
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    src={video.videoBg}
                    alt={video.dataAlt}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Gradient overlay for bottom readability */}
          <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-10"></div>
          
          {/* Live badge element removed */}



          {/* Right Action floating rail */}
          <div className="absolute right-md bottom-[130px] z-30 flex flex-col gap-md items-center pointer-events-auto">
            
            {/* Like Action */}
            <button 
              onClick={toggleLike}
              className="flex flex-col items-center gap-xs text-white hover:text-primary-fixed transition-colors group/btn"
            >
              <div className={`w-10 h-10 rounded-full backdrop-blur-sm border-[0.5px] border-white/30 flex items-center justify-center transition-all ${
                isLiked ? "bg-primary text-on-primary border-primary scale-110" : "bg-black/20 hover:bg-black/40 text-white"
              }`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>
                  favorite
                </span>
              </div>
              <span className="font-label-xs text-label-xs text-white/90 drop-shadow-md">
                {currentLikesCount.toLocaleString()}
              </span>
            </button>

            {/* Share Action */}
            <button 
              onClick={() => alert("Copied video link to clipboard!")}
              className="flex flex-col items-center gap-xs text-white hover:text-primary-fixed transition-colors group/btn"
            >
              <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm border-[0.5px] border-white/30 flex items-center justify-center hover:bg-black/40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>share</span>
              </div>
              <span className="font-label-xs text-label-xs text-white/90 drop-shadow-md">Share</span>
            </button>

            {/* Add to cart quick action */}
            <button 
              onClick={handleAddToCart}
              className="flex flex-col items-center gap-xs text-white hover:text-primary-fixed transition-colors group/btn"
            >
              <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm border-[0.5px] border-white/30 flex items-center justify-center hover:bg-black/40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add_shopping_cart</span>
              </div>
              <span className="font-label-xs text-label-xs text-white/90 drop-shadow-md">Add to cart</span>
            </button>
          </div>

          {/* Bottom Info overlay (Artisan & Product Pin) */}
          <div className="absolute bottom-0 left-0 w-full p-md flex flex-col gap-sm z-20 pointer-events-auto">
            {/* Seller profile information */}
            <div className="flex items-center gap-sm">
              <div className="w-8 h-8 rounded-full overflow-hidden border-[0.5px] border-white/50 bg-surface">
                <img 
                  alt={activeVideo.seller} 
                  className="w-full h-full object-cover" 
                  src={activeVideo.avatar} 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-body-md text-body-md text-white font-medium drop-shadow-md">
                  {activeVideo.seller}
                </span>
                <span className="font-label-xs text-label-xs text-white/80 drop-shadow-md">
                  {activeVideo.location}
                </span>
              </div>
              <button 
                onClick={toggleFollow}
                className={`ml-2 px-sm py-[2px] rounded-full border-[0.5px] font-label-xs text-label-xs backdrop-blur-sm transition-colors ${
                  isFollowed 
                    ? "bg-white text-black border-white" 
                    : "bg-transparent text-white border-white/50 hover:bg-white/20"
                }`}
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-white/95 line-clamp-2 drop-shadow-md w-[85%] leading-snug">
              {activeVideo.description}
            </p>

            {/* Shoppable Product Card Overlay */}
            <div className="w-full bg-surface/95 backdrop-blur-md rounded-lg border-[0.5px] border-outline-variant p-sm flex items-center justify-between mt-xs transform translate-y-0 transition-transform duration-300">
              <Link
                href={`/product/${activeVideo.id}`}
                className="flex items-center gap-sm overflow-hidden flex-1 mr-xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded bg-surface-container-high border-[0.5px] border-outline-variant flex-shrink-0 overflow-hidden">
                  <img 
                    alt={activeVideo.title} 
                    className="w-full h-full object-cover" 
                    src={activeVideo.productThumb} 
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                    {activeVideo.title}
                  </span>
                  <span className="font-price-md text-price-md text-primary font-bold mt-0.5">
                    ₹{activeVideo.price.toLocaleString()}
                  </span>
                </div>
              </Link>
              <button 
                onClick={handleBuyNow}
                className="flex-shrink-0 bg-primary text-on-primary px-md py-sm rounded-lg font-body-sm text-body-sm font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200 active:scale-95"
              >
                Buy Now
              </button>
            </div>
          </div>

        </section>

        {/* Right Sidebar: Up Next Video List (Desktop Only) */}
        <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-100px)] py-xl gap-xl justify-center z-10">
          <div className="bg-surface-container-low rounded-xl border-[0.5px] border-outline-variant p-md flex flex-col gap-md shadow-md">
            <h3 className="font-body-lg text-body-lg text-on-surface font-semibold border-b-[0.5px] border-outline-variant pb-sm">
              {activeCategoryFilter === "all" ? "Up Next" : `${activeCategoryFilter.toUpperCase()} Crafts`}
            </h3>
            
            <div className="flex flex-col gap-md overflow-y-auto max-h-[300px] pr-xs hide-scrollbar">
              {nextUpVideos.length === 0 ? (
                <div className="text-xs text-on-surface-variant text-center py-sm italic">
                  No other videos in this category.
                </div>
              ) : (
                nextUpVideos.map((video) => {
                  const filteredIdx = filteredVideos.findIndex((val) => val.id === video.id);
                  return (
                    <div 
                      key={video.id}
                      onClick={() => setActiveVideoIdx(filteredIdx)}
                      className="flex gap-sm items-start group cursor-pointer border border-transparent hover:border-primary-fixed-dim/20 hover:bg-white/5 p-1 rounded-lg transition-all"
                    >
                      <div className="w-16 h-20 rounded bg-surface-container-high border-[0.5px] border-outline-variant overflow-hidden flex-shrink-0 relative">
                        <img 
                          alt={video.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          src={video.productThumb} 
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 text-[9px] text-white font-price-md">0:15</div>
                      </div>
                      <div className="flex flex-col gap-[2px] min-w-0">
                        <span className="font-body-sm text-body-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors font-medium">
                          {video.title}
                        </span>
                        <span className="font-label-xs text-label-xs text-on-surface-variant font-semibold">
                          {video.seller}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Clear Filters helper inside Sidebar */}
            {activeCategoryFilter !== "all" && (
              <button 
                onClick={() => {
                  setActiveCategoryFilter("all");
                  setActiveVideoIdx(0);
                }}
                className="text-xs font-bold text-primary hover:underline self-start pt-xs border-t border-outline-variant/30 w-full text-left"
              >
                Clear category filter
              </button>
            )}
          </div>
        </aside>
      </main>

      {/* 3. MOBILE BOTTOM NAVBAR */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-30 flex justify-around items-center bg-surface py-xs border-t-[0.5px] border-outline-variant rounded-t-xl text-primary dark:text-primary-fixed-dim font-label-xs text-label-xs shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => {
            setActiveCategoryFilter("all");
            setActiveVideoIdx(0);
            alert("Switched to home feed!");
          }}
          className={`flex flex-col items-center justify-center hover:text-primary transition-colors duration-200 ${
            activeCategoryFilter === "all" ? "text-primary translate-y-[-2px]" : "text-secondary"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeCategoryFilter === "all" ? "'FILL' 1" : "'FILL' 0" }}>home</span>
          <span>Home</span>
        </button>
        <button 
          onClick={() => setIsCategorySidebarOpen(true)}
          className="flex flex-col items-center justify-center text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>grid_view</span>
          <span>Categories</span>
        </button>
        <Link 
          href={
            isSignedIn && (session?.user as any)?.role === "ADMIN"
              ? "/admin"
              : isSignedIn && accountType === "seller"
              ? "/seller/dashboard"
              : "/profile"
          }
          className="flex flex-col items-center justify-center text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            {isSignedIn && (session?.user as any)?.role === "ADMIN"
              ? "admin_panel_settings"
              : isSignedIn && accountType === "seller"
              ? "dashboard"
              : "person"}
          </span>
          <span>
            {isSignedIn && (session?.user as any)?.role === "ADMIN"
              ? "Admin"
              : isSignedIn && accountType === "seller"
              ? "Studio"
              : "Account"}
          </span>
        </Link>
      </nav>

      {/* 4. DYNAMIC SLIDING CATEGORY SIDEBAR */}
      {isCategorySidebarOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsCategorySidebarOpen(false)}
            aria-hidden="true" 
            className="fixed inset-0 z-40 sidebar-overlay"
          />
          
          {/* Sidebar Panel */}
          <aside className="fixed inset-y-0 left-0 z-50 w-[72%] max-w-[280px] bg-surface flex flex-col sidebar-panel border-r-[0.5px] border-outline-variant shadow-lg">
            {/* Header */}
            <div className="px-md py-md flex items-center justify-between border-b-[0.5px] border-outline-variant shrink-0">
              <h2 className="font-body-sm text-body-sm font-semibold text-on-surface">Shop by category</h2>
              <button 
                onClick={() => setIsCategorySidebarOpen(false)}
                aria-label="Close menu" 
                className="p-xs -mr-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            {/* Scrollable Navigation List */}
            <nav className="flex-1 overflow-y-auto py-sm hide-scrollbar">
              <ul className="flex flex-col">
                {SIDEBAR_CATEGORIES.map((cat, idx) => {
                  const isCatActive = activeCategoryFilter === cat.id;
                  
                  return (
                    <li 
                      key={cat.id} 
                      className="stagger-item" 
                      style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                    >
                      <a 
                        onClick={(e) => handleSelectCategory(cat.id, e)}
                        className={`flex items-center h-[48px] px-md border-l-[2px] transition-all ${
                          isCatActive 
                            ? "border-primary bg-primary-container/10 text-primary font-bold" 
                            : "border-transparent text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                        href="#"
                      >
                        <span 
                          className="material-symbols-outlined mr-sm text-[18px]" 
                          style={{ fontVariationSettings: isCatActive ? "'wght' 500" : "'wght' 400" }}
                        >
                          {cat.icon}
                        </span>
                        <span className="font-body-sm text-body-sm">{cat.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

             {/* Footer Actions */}
            <div className="border-t-[0.5px] border-outline-variant py-sm shrink-0 bg-surface">
              <ul className="flex flex-col">
                <li className="stagger-item" style={{ animationDelay: "550ms" }}>
                  <a 
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isSignedIn) {
                        router.push("/sign-in?redirect_url=/profile");
                        return;
                      }
                      alert("Opening Wishlist items...");
                      setIsCategorySidebarOpen(false);
                    }}
                    className="flex items-center h-[48px] px-md text-on-surface hover:bg-surface-container-low transition-colors" 
                    href="#"
                  >
                    <span className="material-symbols-outlined mr-sm text-[18px]">favorite</span>
                    <span className="font-body-sm text-body-sm">My wishlist</span>
                  </a>
                </li>
                <li className="stagger-item" style={{ animationDelay: "600ms" }}>
                  <Link 
                    href={isSignedIn ? "/orders" : "/login?redirect=/orders"}
                    onClick={() => setIsCategorySidebarOpen(false)}
                    className="flex items-center h-[48px] px-md text-on-surface hover:bg-surface-container-low transition-colors" 
                  >
                    <span className="material-symbols-outlined mr-sm text-[18px]">receipt_long</span>
                    <span className="font-body-sm text-body-sm">My orders</span>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </>
      )}

    </div>
  );
}
