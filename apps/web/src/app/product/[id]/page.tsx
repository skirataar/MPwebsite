"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "../../../data/products";
import { addToCart, getCartCount } from "../../../utils/cart";
import { isProductLiked, toggleLikeProduct } from "../../../utils/likes";
import { isProductInWishlist, toggleWishlistProduct } from "../../../utils/wishlist";
import { useSession } from "next-auth/react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  interface ReviewData {
    _id: string;
    userId: {
      _id: string;
      name: string;
      avatarUrl?: string;
    } | null;
    rating: number;
    comment: string;
    createdAt: string;
  }
  
  // React state hooks at top-level
  const [isLiked, setIsLiked] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");
  const [isFollowed, setIsFollowed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Review System State
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync theme and header scroll states
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = theme === "dark" || (!theme && systemPrefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

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

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("login-updated", syncLogin);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("login-updated", syncLogin);
      window.removeEventListener("scroll", handleScroll);
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

  // Fetch product data
  useEffect(() => {
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
            reviewsCount: 12,
            viewsCount: `${data.product.viewsCount ?? 0} views`,
            freeDelivery: true,
            deliveryDate: "Oct 28 - 30",
            returnPolicy: "7 Days Return Policy",
            returnPolicyDesc: "No questions asked returns on undamaged items.",
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

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`/api/products/${params?.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchReviews();
    }
  }, [params?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!newComment.trim()) {
      setSubmitError("Please write a comment.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/products/${params?.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Failed to submit review.");
        return;
      }

      setSubmitSuccess(true);
      setNewComment("");
      setNewRating(5);
      await fetchReviews();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamically calculate average rating and reviews count
  const reviewsCount = reviews.length;
  const averageRating = reviewsCount > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
    : 5.0; // default to 5.0

  const renderStars = (rating: number, size = 20) => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const starVal = idx + 1;
      let fill = "0";
      let name = "star";
      if (rating >= starVal) {
        fill = "1";
      } else if (rating > starVal - 1) {
        name = "star_half";
        fill = "1";
      }
      return (
        <span
          key={idx}
          className="material-symbols-outlined"
          style={{ fontSize: `${size}px`, fontVariationSettings: `'FILL' ${fill}` }}
        >
          {name}
        </span>
      );
    });
  };

  // Sync likes
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

  // Sync wishlist
  useEffect(() => {
    if (product) {
      setIsWishlisted(isProductInWishlist(product.id));
    }

    const syncWishlist = () => {
      if (product) {
        setIsWishlisted(isProductInWishlist(product.id));
      }
    };

    window.addEventListener("wishlist-updated", syncWishlist);
    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
    };
  }, [product]);

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isLoggedIn) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }
    const wishlisted = await toggleWishlistProduct(product.id);
    setIsWishlisted(wishlisted);
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-md text-center">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="font-medium text-body-md text-on-surface-variant animate-pulse">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-screen min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-md text-center">
        <span className="material-symbols-outlined text-[64px] text-outline mb-md">error</span>
        <h1 className="font-headline-md text-headline-md font-semibold mb-sm">Product Not Found</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg max-w-sm">
          The product you are looking for does not exist or has been removed from our marketplace feed.
        </p>
        <Link
          href="/"
          className="h-xxl px-lg bg-primary text-on-primary rounded-lg font-body-md text-body-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center active:scale-95 shadow-md"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;
    setShareLink(window.location.href);
    setCopied(false);
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareLink);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareLink;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback: still show copied UI state so user experience is smooth
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }
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
  };

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

  // Calculations
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const stockPercentage = product.stockLeft !== undefined
    ? Math.min((product.stockLeft / 30) * 100, 100)
    : 100;

  return (
    <div className="bg-background text-on-background min-h-screen relative pb-huge flex flex-col font-body-md select-none">
      
      {/* 1. STICKY APP HEADER BAR */}
      <header className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-md py-sm transition-all duration-300 ${
        scrolled 
          ? "bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm py-xs" 
          : "bg-transparent"
      }`}>
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-surface-container/60 hover:bg-surface-container/90 border border-outline-variant/20 backdrop-blur-md flex items-center justify-center text-on-surface active:scale-95 transition-all"
          aria-label="Go Back"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </button>
        <div className="flex gap-sm">
          {/* Dark Mode toggle button */}
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-surface-container/60 hover:bg-surface-container/90 border border-outline-variant/20 backdrop-blur-md flex items-center justify-center text-on-surface active:scale-95 transition-all"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isDark ? "'FILL' 1" : "'FILL' 0" }}>
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <Link
            href={isLoggedIn ? "/cart" : `/login?redirect=/cart`}
            id="cart-icon-header"
            className="w-10 h-10 rounded-full bg-surface-container/60 hover:bg-surface-container/90 border border-outline-variant/20 backdrop-blur-md flex items-center justify-center text-on-surface active:scale-95 transition-all relative"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[8px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border border-surface animate-bounce-subtle">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={async () => {
              if (!isLoggedIn) {
                router.push(`/login?redirect=/product/${product.id}`);
                return;
              }
              const liked = await toggleLikeProduct(product.id);
              setIsLiked(liked);
            }}
            className={`w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center active:scale-95 transition-all ${
              isLiked 
                ? "bg-primary text-on-primary border-primary scale-105 shadow-md shadow-primary/20" 
                : "bg-surface-container/60 hover:bg-surface-container/90 border-outline-variant/20 text-on-surface"
            }`}
            aria-label="Favorite"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-surface-container/60 hover:bg-surface-container/90 border border-outline-variant/20 backdrop-blur-md flex items-center justify-center text-on-surface active:scale-95 transition-all"
            aria-label="Share"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>share</span>
          </button>
        </div>
      </header>

      {/* 2. RESPONSIVE MAIN CONTAINER */}
      <main className="w-full max-w-7xl mx-auto px-md md:px-lg lg:px-xl pt-[76px] pb-xxl flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg lg:gap-xl items-start">
          
          {/* Media Showcase Pane (Left Column) */}
          <section className="col-span-12 md:col-span-7 md:sticky md:top-24 bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-md flex flex-col group transition-all duration-300">
            <div className="relative w-full aspect-video md:aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
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
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    src={product.videoBg || product.productThumb}
                  />
                  {/* Media Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                  
                  {/* Play Overlay Button */}
                  {product.videoUrl && (
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/80 hover:bg-white border border-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl"
                      aria-label="Play Product Video"
                    >
                      <span className="material-symbols-outlined text-primary ml-1 text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_arrow
                      </span>
                    </button>
                  )}
                </>
              )}

              {/* Views Badge overlay */}
              <div className="absolute bottom-md left-md flex items-center gap-xs text-white bg-black/40 backdrop-blur-sm px-sm py-[4px] rounded-full border border-white/10 text-xs">
                <span className="material-symbols-outlined text-[16px] mr-1" style={{ fontVariationSettings: "'FILL' 0" }}>visibility</span>
                <span className="font-medium">{product.viewsCount || `${product.likes * 3} views`}</span>
              </div>

              {/* Status Badge overlay */}
              <div className="absolute top-md left-md flex items-center">
                <span className="bg-primary text-on-primary font-label-xs text-label-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-primary/20 backdrop-blur-md font-semibold tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Craft Feed
                </span>
              </div>
            </div>
          </section>

          {/* Details & Interactive Pane (Right Column) */}
          <section className="col-span-12 md:col-span-5 flex flex-col gap-lg md:gap-xl">
            
            {/* Header info */}
            <div className="flex flex-col gap-sm">
              <span className="bg-primary/5 text-primary border border-primary/10 font-semibold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                {product.category}
              </span>
              
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface leading-tight tracking-tight mt-xs">
                {product.title}
              </h1>

              {/* Rating Section */}
              <div className="flex items-center gap-xs mt-xs">
                <div className="flex items-center text-amber-500">
                  {renderStars(averageRating, 20)}
                </div>
                <span className="font-bold text-body-sm text-on-surface ml-1">{averageRating}</span>
                <span className="text-on-surface-variant/70 text-xs">({reviewsCount} customer reviews)</span>
              </div>

              {/* Pricing section */}
              <div className="flex items-center gap-md mt-sm bg-surface-container-low p-md rounded-2xl border border-outline-variant/20">
                <div className="flex flex-col">
                  <span className="font-price-lg text-[28px] font-bold text-primary">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="font-price-md text-price-md text-on-surface-variant/60 line-through mt-[2px]">
                      MRP ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {discountPercent !== null && discountPercent > 0 && (
                  <span className="ml-auto bg-primary text-on-primary font-bold text-xs px-3 py-1.5 rounded-xl tracking-wider shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Stock Warning Progress Bar */}
              {product.stockLeft !== undefined && (
                <div className="flex flex-col gap-xs mt-sm bg-surface-container-low border border-outline-variant/20 rounded-2xl p-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${product.stockLeft <= 5 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                      {product.stockLeft <= 5 ? "Limited Stock Available" : "In Stock"}
                    </span>
                    <span className="text-on-surface-variant font-medium">Only {product.stockLeft} crafts left</span>
                  </div>
                  <div className="w-full bg-outline-variant/30 h-[6px] rounded-full overflow-hidden mt-xs">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        product.stockLeft <= 5 ? "bg-amber-500" : "bg-primary"
                      }`} 
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex gap-md bg-transparent items-center">
              <button
                onClick={handleToggleWishlist}
                className={`w-[48px] h-[48px] shrink-0 rounded-xl border flex items-center justify-center active:scale-98 transition-all ${
                  isWishlisted 
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/30" 
                    : "border-outline hover:bg-surface-container-highest/20 text-on-surface-variant"
                }`}
                aria-label="Wishlist"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
                  favorite
                </span>
              </button>

              <button
                onClick={handleAddToCart}
                className="flex-1 h-[48px] rounded-xl border border-primary hover:bg-primary/5 text-primary font-bold text-body-md flex items-center justify-center gap-xs active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Add to Cart
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={checkoutLoading}
                className="flex-1 h-[48px] rounded-xl bg-primary hover:bg-primary-container hover:text-on-primary-container text-on-primary font-bold text-body-md flex items-center justify-center active:scale-98 transition-all disabled:opacity-50"
              >
                {checkoutLoading ? "Processing..." : "Buy Now"}
              </button>
            </div>

            {/* Seller profile Boutique card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-md flex flex-col gap-md shadow-sm">
              <div className="flex items-center justify-between gap-md">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant border border-outline-variant/30 shrink-0">
                    <img
                      alt={product.seller}
                      className="w-full h-full object-cover"
                      src={product.avatar}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-body-md text-on-surface leading-snug">{product.seller}</span>
                    <span className="text-on-surface-variant/80 text-[11px] font-semibold uppercase tracking-wider">{product.location}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsFollowed(prev => !prev)}
                  className={`px-md h-8 rounded-full border text-xs font-bold transition-all active:scale-95 ${
                    isFollowed 
                      ? "bg-on-surface text-surface border-on-surface" 
                      : "bg-transparent text-primary border-primary hover:bg-primary/5"
                  }`}
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              </div>

              <div className="h-[0.5px] bg-outline-variant/20 w-full"></div>
              
              <button
                onClick={() => alert(`Navigating to ${product.seller}'s Boutique storefront...`)}
                className="w-full h-[36px] rounded-lg border border-outline hover:bg-surface-container-highest/20 font-bold text-xs text-on-surface flex items-center justify-center gap-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                Visit Digital Boutique
              </button>
            </div>

            {/* Tabs details section */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex border-b border-outline-variant/20 bg-surface-container-lowest">
                {(["description", "specifications", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-center py-3 text-xs font-bold capitalize transition-all border-b-2 ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-on-surface-variant/70 hover:text-on-surface"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-md min-h-[120px]">
                {activeTab === "description" && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {product.description}
                  </p>
                )}

                {activeTab === "specifications" && (
                  <div className="flex flex-col gap-sm text-xs text-on-surface-variant font-medium">
                    <div className="flex justify-between py-1 border-b border-outline-variant/10">
                      <span>Category</span>
                      <span className="text-on-surface capitalize font-semibold">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/10">
                      <span>Creator / Seller</span>
                      <span className="text-on-surface font-semibold">{product.seller}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/10">
                      <span>Location</span>
                      <span className="text-on-surface font-semibold">{product.location}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/10">
                      <span>Likes Received</span>
                      <span className="text-on-surface font-semibold">{product.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Return Policy</span>
                      <span className="text-on-surface font-semibold">{product.returnPolicy}</span>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="flex flex-col gap-md">
                    {/* Add Review Form */}
                    {status === "authenticated" ? (
                      <form onSubmit={handleReviewSubmit} className="flex flex-col gap-sm bg-surface-container-low p-md border border-outline-variant/30 rounded-xl">
                        <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider">Write a review</h4>
                        <div className="flex flex-col gap-xs">
                          <label className="text-[11px] font-semibold text-on-surface-variant">Rating</label>
                          <div className="flex gap-xs text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className="hover:scale-110 active:scale-95 transition-transform"
                              >
                                <span
                                  className="material-symbols-outlined text-[24px]"
                                  style={{ fontVariationSettings: `'FILL' ${newRating >= star ? 1 : 0}` }}
                                >
                                  star
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-xs">
                          <label className="text-[11px] font-semibold text-on-surface-variant">Comment</label>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            placeholder="Share your thoughts about this product..."
                            className="bg-surface border border-outline-variant rounded-lg p-sm text-xs outline-none focus:border-primary transition-colors text-on-surface placeholder:text-on-surface-variant/40"
                          />
                        </div>
                        {submitError && (
                          <div className="text-xs text-error font-medium">{submitError}</div>
                        )}
                        {submitSuccess && (
                          <div className="text-xs text-primary font-medium">Review submitted successfully!</div>
                        )}
                        <button
                          type="submit"
                          disabled={submitting}
                          className="h-[36px] bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-xs disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    ) : (
                      <div className="p-md text-center bg-surface-container-low border border-outline-variant/20 rounded-xl">
                        <p className="text-xs text-on-surface-variant">Please sign in to write a review.</p>
                        <Link
                          href={`/login?redirect=/product/${params?.id}`}
                          className="mt-sm inline-block h-[32px] px-md bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center w-fit mx-auto"
                        >
                          Login to Account
                        </Link>
                      </div>
                    )}

                    {/* Reviews List */}
                    {reviewsLoading ? (
                      <div className="text-xs text-on-surface-variant text-center py-md animate-pulse">
                        Loading reviews...
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-xs text-on-surface-variant text-center py-md italic bg-surface-container-lowest p-sm border border-outline-variant/10 rounded-xl">
                        No reviews yet for this product. Be the first to leave a review!
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev._id} className="flex flex-col gap-xs bg-surface-container-lowest p-sm border border-outline-variant/10 rounded-xl">
                          <div className="flex items-center gap-xs">
                            <span className="font-bold text-xs text-on-surface">
                              {rev.userId?.name || "Shopper"}
                            </span>
                            <div className="flex text-amber-500 text-[12px]">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className="material-symbols-outlined text-[14px]"
                                  style={{ fontVariationSettings: `'FILL' ${rev.rating >= i + 1 ? 1 : 0}` }}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] text-on-surface-variant ml-auto font-medium">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant italic leading-relaxed">"{rev.comment}"</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
              <div className="flex items-start gap-sm bg-surface-container-low border border-outline-variant/20 p-sm rounded-xl">
                <span className="material-symbols-outlined text-primary mt-[2px] bg-primary/5 p-xs rounded-lg" style={{ fontVariationSettings: "'FILL' 0" }}>local_shipping</span>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-on-surface">
                    {product.freeDelivery ? "Free Delivery" : "Standard Delivery"}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/80 mt-[2px] font-semibold">
                    Expected by {product.deliveryDate || "Oct 24 - 26"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-sm bg-surface-container-low border border-outline-variant/20 p-sm rounded-xl">
                <span className="material-symbols-outlined text-primary mt-[2px] bg-primary/5 p-xs rounded-lg" style={{ fontVariationSettings: "'FILL' 0" }}>assignment_return</span>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-on-surface">
                    {product.returnPolicy || "7 Days Return Policy"}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/80 mt-[2px] font-semibold">
                    No questions asked return policy
                  </span>
                </div>
              </div>
            </div>
            
          </section>
        </div>
      </main>

      {/* 3. MOBILE STICKY BOTTOM ACTIONS DRAWER */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface/90 border-t border-outline-variant/20 backdrop-blur-md px-md py-sm pb-[calc(10px+env(safe-area-inset-bottom))] flex gap-sm items-center justify-center shadow-lg">
        <div className="w-full max-w-md flex gap-sm bg-transparent">
          <button
            onClick={handleToggleWishlist}
            className={`w-[44px] h-[44px] shrink-0 rounded-xl border flex items-center justify-center active:scale-95 transition-all duration-200 ${
              isWishlisted 
                ? "bg-rose-500/10 text-rose-500 border-rose-500/30" 
                : "border-outline-variant/50 text-on-surface"
            }`}
            aria-label="Wishlist"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
              favorite
            </span>
          </button>

          <button
            onClick={handleAddToCart}
            className="flex-1 h-[44px] rounded-xl border border-primary text-primary font-bold text-xs bg-transparent flex items-center justify-center gap-xs active:scale-95 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            Add to Cart
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={checkoutLoading}
            className="flex-1 h-[44px] rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center active:scale-95 hover:opacity-90 transition-all duration-200 shadow-md shadow-primary/10 disabled:opacity-50"
          >
            {checkoutLoading ? "Processing..." : "Buy Now"}
          </button>
        </div>
      </div>

      {shareLink && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-md">
          <div 
            className="bg-surface border border-outline-variant/30 rounded-2xl p-md max-w-sm w-full flex flex-col gap-md shadow-2xl animate-fade-in-up text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-body-lg">Share Product</h3>
              <button 
                onClick={() => setShareLink(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Share this unique handcrafted creation with your friends and family!
            </p>
            <div className="flex gap-sm items-center bg-surface-container-low border border-outline-variant/30 rounded-xl p-[6px]">
              <input 
                type="text" 
                readOnly 
                value={shareLink} 
                className="flex-1 bg-transparent px-2 text-xs font-mono text-on-surface-variant outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="h-[32px] px-md rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-xs active:scale-95 transition-all"
              >
                {copied ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Copied
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
