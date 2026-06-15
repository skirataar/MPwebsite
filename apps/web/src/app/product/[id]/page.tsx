"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, Product } from "../../../data/products";
import { addToCart, getCartCount } from "../../../utils/cart";
import { isProductLiked, toggleLikeProduct } from "../../../utils/likes";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    // Initial sync
    setCartCount(getCartCount());

    const loggedInVal = localStorage.getItem("v-market-logged-in");
    setIsLoggedIn(loggedInVal === "true");

    const syncCart = () => {
      setCartCount(getCartCount());
    };

    const syncLogin = () => {
      const currentVal = localStorage.getItem("v-market-logged-in");
      setIsLoggedIn(currentVal === "true");
    };

    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("login-updated", syncLogin);
    return () => {
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("login-updated", syncLogin);
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

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isStaticId = typeof params?.id === "string" && /^\d+$/.test(params.id);
    const staticProduct = isStaticId ? PRODUCTS.find((p) => String(p.id) === params.id) : null;

    if (staticProduct) {
      setProduct(staticProduct);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${params?.id}`);
        if (!res.ok) {
          setProduct(null);
          return;
        }
        const data = await res.json();
        if (data.product) {
          const adaptedProduct: Product = {
            id: data.product._id,
            title: data.product.title,
            category: data.product.category,
            description: data.product.description,
            price: data.product.price,
            originalPrice: data.product.mrp,
            seller: data.product.sellerId?.name || "Artisan",
            username: `@${data.product.sellerId?.username || "artisan"}`,
            location: "India",
            likes: data.product.likesCount ?? 0,
            avatar: data.product.sellerId?.avatarUrl || "https://ui-avatars.com/api/?name=Artisan&background=random",
            videoBg: data.product.imageUrl,
            videoUrl: data.product.videoUrl || undefined,
            productThumb: data.product.imageUrl,
            dataAlt: data.product.title,
            stockLeft: data.product.stock,
            rating: 4.8,
            reviewsCount: 0,
            viewsCount: `${data.product.viewsCount ?? 0} views`,
            freeDelivery: true,
          };
          setProduct(adaptedProduct);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  useEffect(() => {
    if (product) {
      setIsLiked(isProductLiked(product.id));
    }

    const syncLikes = () => {
      if (product) {
        setIsLiked(isProductLiked(product.id));
      }
    };

    window.addEventListener("likes-updated", syncLikes);
    return () => {
      window.removeEventListener("likes-updated", syncLikes);
    };
  }, [product]);

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-md text-center">
        <div className="animate-pulse">Loading Product Details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-md text-center">
        <span className="material-symbols-outlined text-[64px] text-outline mb-md">error</span>
        <h1 className="font-headline-md text-headline-md font-semibold mb-sm">Product Not Found</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/"
          className="h-xxl px-lg bg-primary text-on-primary rounded-lg font-body-md text-body-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center active:scale-95"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  const handleBack = () => {
    // Navigate back or to home page
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }
    if (product) {
      addToCart(product);
      
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
        el.src = product.productThumb;
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
    }
  };

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        alert(`Order placed successfully for ${product.title}!`);
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
    <div className="bg-background text-on-background min-h-screen relative pb-huge flex flex-col font-body-md select-none">
      
      {/* Top Navigation App Bar (Transparent overlay for Hero) */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-md py-sm bg-transparent pointer-events-none">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md flex items-center justify-center text-on-surface pointer-events-auto active:scale-95 transition-transform"
          aria-label="Go Back"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </button>
        <div className="flex gap-sm pointer-events-auto">
          {/* Dark Mode toggle button */}
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md flex items-center justify-center text-on-surface active:scale-95 transition-transform"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isDark ? "'FILL' 1" : "'FILL' 0" }}>
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <Link
            href={isLoggedIn ? "/cart" : `/login?redirect=/cart`}
            id="cart-icon-header"
            className="w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md flex items-center justify-center text-on-surface active:scale-95 transition-transform relative"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-surface">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              if (product) {
                if (!isLoggedIn) {
                  router.push(`/login?redirect=/product/${product.id}`);
                  return;
                }
                const liked = toggleLikeProduct(product.id);
                setIsLiked(liked);
              }
            }}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-95 transition-all ${
              isLiked ? "bg-primary text-on-primary scale-105" : "bg-surface/30 text-on-surface"
            }`}
            aria-label="Favorite"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md flex items-center justify-center text-on-surface active:scale-95 transition-transform"
            aria-label="Share"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>share</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col w-full max-w-md mx-auto relative">
        
        {/* Hero Video Section */}
        <section className="relative w-full aspect-video bg-surface-variant z-10 overflow-hidden flex items-center justify-center">
          {product.videoUrl && isPlaying ? (
            <video
              src={product.videoUrl}
              className="w-full h-full object-cover"
              controls
              autoPlay
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
          ) : (
            <>
              <img
                alt={product.title}
                className="w-full h-full object-cover"
                data-alt={product.dataAlt}
                src={product.videoBg || product.productThumb}
              />
              {/* Video Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Play Button */}
              {product.videoUrl && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-xxl h-xxl bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-sm border-[0.5px] border-white/20"
                  aria-label="Play Product Video"
                >
                  <span className="material-symbols-outlined text-on-surface ml-1" style={{ fontVariationSettings: "'FILL' 1", fontSize: "28px" }}>
                    play_arrow
                  </span>
                </button>
              )}
            </>
          )}
          
          {/* View Count Overlay */}
          <div className="absolute bottom-sm left-md flex items-center gap-xs text-white">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0" }}>visibility</span>
            <span className="font-label-xs text-label-xs font-medium">{product.viewsCount || `${product.likes * 2} views`}</span>
          </div>
          
          {/* Badges Top Left */}
          <div className="absolute top-20 left-md flex items-center">
            <span className="bg-primary/90 text-on-primary font-label-xs text-label-xs px-2 py-1 rounded-[4px] flex items-center gap-1 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Live
            </span>
          </div>
        </section>

        {/* Content Card Area */}
        <section className="relative z-20 bg-surface rounded-t-[20px] -mt-md pt-lg px-md pb-xxl flex flex-col gap-lg border-t-[0.5px] border-outline-variant shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
          
          {/* Header & Price Info */}
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-start gap-md">
              <h1 className="font-body-lg text-body-lg font-medium text-on-surface leading-tight">
                {product.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-md mt-xs">
              <div className="flex items-baseline gap-xs">
                <span className="font-price-lg text-[24px] font-medium text-on-surface">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="font-price-md text-price-md text-on-surface-variant line-through opacity-60">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.discount && (
                <span className="bg-primary-container text-primary font-label-xs text-label-xs px-2 py-1 rounded-[4px] font-medium tracking-wide">
                  {product.discount}
                </span>
              )}
            </div>

            {/* Stock Warning */}
            {product.stockLeft !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${product.stockLeft <= 5 ? "bg-amber-500" : "bg-green-500"}`}></span>
                <span className="font-label-xs text-label-xs text-on-surface-variant">
                  Only {product.stockLeft} left in stock - order soon
                </span>
              </div>
            )}
          </div>

          {/* Dividers are fine lines without shadows */}
          <div className="h-[0.5px] w-full bg-outline-variant/50"></div>

          {/* Seller Row */}
          <div className="flex items-center justify-between p-sm bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-lg">
            <div className="flex items-center gap-sm">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant border-[0.5px] border-outline-variant shrink-0">
                <img
                  alt={product.seller}
                  className="w-full h-full object-cover"
                  src={product.avatar}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm font-medium text-on-surface">{product.seller}</span>
                <div className="flex items-center text-on-surface-variant opacity-80">
                  <span className="material-symbols-outlined text-[12px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-xs text-[10px]">
                    {product.rating || "5.0"} ({product.reviewsCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => alert(`Navigating to ${product.seller}'s digital boutique store...`)}
              className="flex items-center gap-1 font-label-xs text-label-xs text-primary font-medium hover:opacity-80 transition-opacity"
            >
              View store <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Product Description */}
          <div className="flex flex-col gap-xs">
            <h3 className="font-body-sm text-body-sm font-medium text-on-surface">Product Details</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {product.description}
            </p>
            <button
              onClick={() => alert("Detailed technical specs & craftsmanship details drawer expanding soon...")}
              className="self-start mt-1 font-body-sm text-body-sm text-primary font-medium hover:underline decoration-[0.5px] underline-offset-4 transition-all"
            >
              Read more
            </button>
          </div>

          <div className="h-[0.5px] w-full bg-outline-variant/50"></div>

          {/* Shipping Info */}
          <div className="flex flex-col gap-sm">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-on-surface-variant mt-0.5" style={{ fontVariationSettings: "'FILL' 0" }}>local_shipping</span>
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface font-medium">
                  {product.freeDelivery ? "Free Delivery" : "Standard Delivery"}
                </span>
                <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                  Estimated delivery by {product.deliveryDate || "Oct 24 - 26"}
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-sm mt-xs">
              <span className="material-symbols-outlined text-on-surface-variant mt-0.5" style={{ fontVariationSettings: "'FILL' 0" }}>assignment_return</span>
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface font-medium">
                  {product.returnPolicy || "7 Days Return Policy"}
                </span>
                <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                  {product.returnPolicyDesc || "No questions asked returns on undamaged items."}
                </span>
              </div>
            </div>
          </div>
          
        </section>
      </main>

      {/* Sticky Bottom Actions Bar (Transaction Intent) */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface/95 backdrop-blur-md border-t-[0.5px] border-outline-variant px-md py-sm pb-[calc(12px+env(safe-area-inset-bottom))] flex gap-sm items-center justify-center">
        <div className="w-full max-w-md flex gap-sm bg-transparent">
          <button
            onClick={handleAddToCart}
            className="flex-1 h-[44px] rounded-lg border-[0.5px] border-primary text-primary font-body-sm text-body-sm font-medium bg-transparent flex items-center justify-center gap-xs active:scale-95 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            Add to cart
          </button>
          
          <button
            onClick={handleBuyNow}
            className="flex-1 h-[44px] rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium flex items-center justify-center active:scale-95 hover:bg-primary/90 transition-all duration-200 shadow-sm"
          >
            Buy now
          </button>
        </div>
      </div>
      
    </div>
  );
}
