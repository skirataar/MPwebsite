"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────
interface DBListing {
  _id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  mrp?: number;
  stock: number;
  imageUrl: string;
  videoUrl?: string;
  viewsCount: number;
  likesCount: number;
  status: "DRAFT" | "REVIEW" | "LIVE" | "REJECTED";
  createdAt: string;
}

interface DBOrder {
  _id: string;
  amount: number;
  quantity: number;
  status: string;
  createdAt: string;
  productId?: { title: string; imageUrl: string } | null;
}

interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalOrders: number;
  totalRevenue: number;
  liveCount: number;
}

// ─── Avatar Fallback ─────────────────────────────────────────────────
function AvatarFallback({ name, imageUrl, size = 40 }: { name: string; imageUrl?: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImgError(true)}
        className="rounded-full object-cover border-[0.5px] border-outline-variant"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-primary text-on-primary flex items-center justify-center font-bold border-[0.5px] border-outline-variant shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || "A"}
    </div>
  );
}

// ─── Upload Wizard ────────────────────────────────────────────────────
function UploadWizard({
  onPublish,
  onClose,
}: {
  onPublish: (item: DBListing) => void;
  onClose: () => void;
}) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1 — file upload
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 — details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("1");
  const [category, setCategory] = useState("handmade");
  const [manualUrl, setManualUrl] = useState("");

  // Step 3 — submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const discountPct =
    mrp && price && parseFloat(mrp) > 0
      ? Math.round(((parseFloat(mrp) - parseFloat(price)) / parseFloat(mrp)) * 100)
      : 0;

  const effectiveUrl = uploadedUrl || manualUrl;

  const uploadToCloudinary = useCallback(
    async (file: File) => {
      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        // No Cloudinary config — use object URL for preview only
        const objUrl = URL.createObjectURL(file);
        setUploadedUrl(objUrl);
        setUploadState("done");
        setFilePreview(objUrl);
        return;
      }

      setUploadState("uploading");
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            setUploadedUrl(res.secure_url);
            setUploadState("done");
            setUploadProgress(100);
            setStep(2);
          } else {
            setUploadState("error");
          }
        };

        xhr.onerror = () => setUploadState("error");
        xhr.send(formData);
      } catch {
        setUploadState("error");
      }
    },
    [CLOUD_NAME, UPLOAD_PRESET]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setFileType(isVideo ? "video" : "image");
    setFilePreview(URL.createObjectURL(file));
    uploadToCloudinary(file);
  };

  const handleNext = () => {
    if (step === 1 && !effectiveUrl) return;
    if (step === 2 && (!title.trim() || !price)) return;
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!effectiveUrl || !title || !price) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const isVideo = fileType === "video" || effectiveUrl.includes("/video/");
      const body = {
        title,
        description,
        price,
        mrp: mrp || undefined,
        stock,
        category,
        imageUrl: isVideo ? (effectiveUrl.replace("/video/upload/", "/image/upload/").replace(/\.\w+$/, ".jpg")) : effectiveUrl,
        videoUrl: isVideo ? effectiveUrl : undefined,
        thumbnailUrl: isVideo ? effectiveUrl.replace("/video/upload/", "/image/upload/").replace(/\.\w+$/, ".jpg") : undefined,
      };

      const res = await fetch("/api/seller/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to publish listing.");
        setSubmitting(false);
        return;
      }

      onPublish(data.product);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const progressW = `${((step - 1) / (totalSteps - 1)) * 100}%`;
  const dotClass = (n: number) =>
    n <= step
      ? "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-xs text-label-xs shadow-[0_0_0_4px_var(--tw-shadow-color)] shadow-surface transition-all duration-300"
      : "w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-xs text-label-xs border-[0.5px] border-outline-variant transition-all duration-300";

  const inputClass =
    "h-[44px] w-full border-[0.5px] border-outline-variant rounded-lg px-sm bg-transparent font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <h2 className="font-headline-md text-headline-md text-on-background">New Listing</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>close</span>
        </button>
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between relative mb-lg">
        <div className="absolute left-0 right-0 top-4 h-[2px] bg-surface-container-high -z-10 rounded-full overflow-hidden mx-4">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: progressW }} />
        </div>
        {[{ n: 1, label: "Upload" }, { n: 2, label: "Details" }, { n: 3, label: "Review" }].map(({ n, label }) => (
          <div key={n} className="flex flex-col items-center gap-xs bg-surface px-1 z-10">
            <div className={dotClass(n)}>
              {n < step ? <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span> : n}
            </div>
            <span className={`font-label-xs text-label-xs ${n === step ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto pb-[80px]">

        {/* ── Step 1: Upload ── */}
        {step === 1 && (
          <div className="flex flex-col gap-md" style={{ minHeight: "320px" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => uploadState === "idle" && fileInputRef.current?.click()}
              disabled={uploadState === "uploading" || uploadState === "done"}
              className="flex-1 flex flex-col items-center justify-center border-[0.5px] border-dashed border-outline rounded-xl bg-surface-container-low p-xl text-center cursor-pointer hover:bg-surface-container transition-colors group disabled:cursor-default relative overflow-hidden"
            >
              {filePreview && fileType === "image" && (
                <img src={filePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-20 rounded-xl" />
              )}
              <span
                className="material-symbols-outlined text-outline mb-sm transition-opacity"
                style={{ fontSize: "48px", opacity: uploadState === "uploading" ? 0.4 : 1 }}
              >
                {uploadState === "done" ? "check_circle" : "upload_file"}
              </span>
              <p className="font-body-md text-body-md text-on-surface mb-xs">
                {uploadState === "idle"
                  ? "Tap to upload image or video"
                  : uploadState === "uploading"
                  ? `Uploading… ${uploadProgress}%`
                  : uploadState === "done"
                  ? "Upload complete ✓"
                  : "Upload failed — try again"}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">JPG, PNG, MP4, MOV</p>

              {uploadState === "uploading" && (
                <div className="mt-xl w-full max-w-[200px] h-[4px] bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              {uploadState === "error" && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setUploadState("idle"); setFilePreview(null); }}
                  className="mt-sm text-error text-sm underline"
                >
                  Retry
                </button>
              )}
            </button>

            <div className="flex flex-col gap-xs">
              <label className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
                Or paste image / video URL
              </label>
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => { setManualUrl(e.target.value); if (e.target.value) setUploadState("done"); }}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Details ── */}
        {step === 2 && (
          <div className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <label className="font-label-xs text-label-xs text-on-surface uppercase tracking-wider">Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Handwoven Silk Saree" className={inputClass} />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-xs text-label-xs text-on-surface uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item, materials, and condition..."
                rows={3}
                className="w-full border-[0.5px] border-outline-variant rounded-lg p-sm bg-transparent font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-xs text-label-xs text-on-surface uppercase tracking-wider">Selling Price *</label>
                <div className="relative">
                  <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className={`${inputClass} pl-[28px] [appearance:textfield]`} />
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-xs text-label-xs text-on-surface uppercase tracking-wider">MRP</label>
                  {discountPct > 0 && (
                    <span className="font-label-xs text-label-xs bg-primary-container text-on-primary-container px-[6px] py-[2px] rounded-full">{discountPct}% OFF</span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                  <input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="0" className={`${inputClass} pl-[28px] [appearance:textfield]`} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-xs text-label-xs text-on-surface uppercase tracking-wider">Stock</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="1" className={`${inputClass} [appearance:textfield]`} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-xs text-label-xs text-on-surface uppercase tracking-wider">Category</label>
                <div className="relative">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="fashion">Fashion</option>
                    <option value="handmade">Handmade</option>
                    <option value="food">Food &amp; Drinks</option>
                    <option value="home-decor">Home Decor</option>
                    <option value="beauty">Beauty</option>
                    <option value="electronics">Electronics</option>
                    <option value="stationery">Stationery</option>
                    <option value="toys">Toys</option>
                    <option value="sports">Sports</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{ fontSize: "20px" }}>expand_more</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (() => {
          const isVideo = fileType === "video" || effectiveUrl.includes("/video/") || effectiveUrl.endsWith(".mp4") || effectiveUrl.endsWith(".mov");
          return (
            <div className="flex flex-col gap-md">
              <div className="border-[0.5px] border-outline-variant rounded-lg p-md flex gap-md items-start bg-surface-container-lowest">
                <div className="w-20 h-24 bg-surface-container rounded-md overflow-hidden relative border-[0.5px] border-outline-variant flex-shrink-0 flex items-center justify-center">
                  {effectiveUrl ? (
                    isVideo ? (
                      <video src={effectiveUrl} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <img src={effectiveUrl} alt={title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "")} />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-secondary-container animate-pulse" />
                  )}
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <h3 className="font-body-md text-body-md font-medium text-on-surface mb-[2px] truncate">{title || "Untitled"}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-sm line-clamp-1 capitalize">{category} • {stock} in stock</p>
                  <div className="flex items-end gap-sm mt-auto">
                    <span className="font-price-lg text-price-lg text-on-surface">₹{parseInt(price, 10) ? parseInt(price, 10).toLocaleString() : "—"}</span>
                    {mrp && parseInt(mrp, 10) > parseInt(price, 10) && (
                      <span className="font-price-md text-price-md text-outline line-through mb-[2px]">₹{parseInt(mrp, 10).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-sm bg-error-container text-on-error-container rounded-lg text-sm text-center">{submitError}</div>
              )}

              <div className="bg-surface-variant/30 border-[0.5px] border-outline-variant rounded-lg p-sm flex items-start gap-sm">
                <span className="material-symbols-outlined text-outline mt-[2px]" style={{ fontSize: "18px" }}>info</span>
                <div>
                  <p className="font-body-sm text-body-sm font-medium text-on-surface">Goes Live Immediately</p>
                  <p className="font-label-xs text-label-xs text-on-surface-variant mt-[2px]">Your listing will appear on the feed right away.</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface border-t-[0.5px] border-outline-variant p-md flex justify-between gap-sm">
        <button
          onClick={() => step > 1 ? setStep((s) => s - 1) : onClose()}
          className="h-[44px] px-lg rounded-lg border-[0.5px] border-primary text-primary font-body-sm text-body-sm font-medium hover:bg-primary-container transition-colors"
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>
        {step < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={(step === 1 && !effectiveUrl) || (step === 2 && (!title.trim() || !price))}
            className="flex-1 h-[44px] rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-xs disabled:opacity-40 disabled:pointer-events-none"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-[44px] rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-xs disabled:opacity-60"
          >
            {submitting ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">publish</span>
                Publish Listing
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────
export default function SellerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isMounted, setIsMounted] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  // DB state
  const [listings, setListings] = useState<DBListing[]>([]);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalViews: 0, totalLikes: 0, totalOrders: 0, totalRevenue: 0, liveCount: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const displayName = session?.user?.name || "Artisan Studio";
  const userEmail = session?.user?.email || "";
  const avatarUrl = session?.user?.image;
  const username = userEmail ? `@${userEmail.split("@")[0]}` : "@artisan";

  const sessionRole = (session?.user as any)?.role as string | undefined;
  const isSeller = sessionRole === "SELLER";

  // ── Auth guard ─────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);

    const theme = localStorage.getItem("theme");
    const dark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session) {
      router.push("/seller/login?redirect=/seller/dashboard");
      return;
    }
    if (!isSeller) {
      router.push("/seller/login?redirect=/seller/dashboard");
    }
  }, [status, session, isSeller, router]);

  // ── Load dashboard data from DB ────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const res = await fetch("/api/seller/listings");
      if (res.status === 401 || res.status === 403) {
        router.push("/seller/login?redirect=/seller/dashboard");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setListings(data.listings ?? []);
      setOrders(data.recentOrders ?? []);
      setStats(data.stats ?? { totalViews: 0, totalLikes: 0, totalOrders: 0, totalRevenue: 0, liveCount: 0 });
    } catch (e: any) {
      setDataError(e.message);
    } finally {
      setLoadingData(false);
    }
  }, [router]);

  useEffect(() => {
    if (isSeller && status === "authenticated") {
      loadDashboard();
    }
  }, [isSeller, status, loadDashboard]);

  const handlePublish = (item: DBListing) => {
    setListings((prev) => [item, ...prev]);
    setStats((prev) => ({ ...prev, liveCount: prev.liveCount + 1 }));
    setActiveNav("videos");
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const res = await fetch(`/api/seller/listings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l._id !== id));
    }
  };

  const handleLogOut = async () => {
    localStorage.removeItem("v-market-account-type");
    localStorage.removeItem("v-market-cart");
    localStorage.setItem("v-market-logged-in", "false");
    window.dispatchEvent(new Event("login-updated"));
    window.dispatchEvent(new Event("cart-updated"));
    await signOut();
    router.push("/seller/login");
  };

  // ── Guards ─────────────────────────────────────────────────────────
  if (!isMounted || status === "loading" || (status === "authenticated" && !session)) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center font-body-md text-on-surface">
        <div className="animate-pulse">Loading Seller Studio...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !isSeller) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center font-body-md text-on-surface">
        <div className="animate-pulse">Redirecting to Seller login...</div>
      </div>
    );
  }

  // ── Nav items ──────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "videos", label: "My Listings", icon: "video_library" },
    { id: "orders", label: "Orders", icon: "list_alt" },
    { id: "add", label: "Add Craft", icon: "add_box" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  const statusBadge = (s: DBListing["status"]) => {
    if (s === "LIVE") return (
      <div className="absolute top-xs right-xs bg-primary text-on-primary font-label-xs text-label-xs px-xs py-[2px] rounded flex items-center gap-[4px]">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />Live
      </div>
    );
    if (s === "REVIEW") return (
      <div className="absolute top-xs right-xs bg-surface-container-high text-on-surface-variant font-label-xs text-label-xs px-xs py-[2px] rounded border-[0.5px] border-outline-variant">
        In Review
      </div>
    );
    if (s === "REJECTED") return (
      <div className="absolute top-xs right-xs bg-error-container text-on-error-container font-label-xs text-label-xs px-xs py-[2px] rounded">
        Rejected
      </div>
    );
    return null;
  };

  const orderBadge = (s: string) => {
    if (s === "PAID" || s === "ESCROW_RELEASED") return <span className="inline-block bg-primary-container text-on-primary-container font-label-xs text-label-xs px-xs py-[2px] rounded mt-[2px]">Paid</span>;
    if (s === "PENDING") return <span className="inline-block bg-surface-container-high text-on-surface-variant font-label-xs text-label-xs px-xs py-[2px] rounded mt-[2px] border-[0.5px] border-outline-variant">Pending</span>;
    return <span className="inline-block bg-error-container text-on-error-container font-label-xs text-label-xs px-xs py-[2px] rounded mt-[2px]">{s}</span>;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body-md text-on-background antialiased">

      {/* ─── Fixed Left Sidebar ─── */}
      <aside className="fixed left-0 top-0 h-full w-[200px] z-40 flex flex-col bg-surface border-r-[0.5px] border-outline-variant">
        <div className="px-md py-lg border-b-[0.5px] border-outline-variant">
          <h1 className="font-headline-md text-headline-md text-primary font-bold leading-tight">V-Market India</h1>
          <p className="font-label-xs text-label-xs text-on-surface-variant mt-[2px]">Seller Portal</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-md px-sm space-y-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-md px-md py-sm rounded-lg font-body-sm text-body-sm transition-all text-left ${
                activeNav === item.id
                  ? "bg-primary-container text-on-primary-container font-medium"
                  : "text-on-surface-variant hover:bg-surface-container hover:opacity-80"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activeNav === item.id ? "'FILL' 1" : "'FILL' 0", fontSize: "20px" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
          <Link
            href="/"
            className="w-full flex items-center gap-md px-md py-sm rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:opacity-80 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>home</span>
            Browse Feed
          </Link>
        </nav>

        {/* Balance widget */}
        <div className="p-md border-t-[0.5px] border-outline-variant">
          <div className="bg-surface-container-low rounded-lg p-sm border-[0.5px] border-outline-variant">
            <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Available Balance</p>
            <p className="font-price-lg text-price-lg text-primary mt-xs">
              ₹{loadingData ? "—" : stats.totalRevenue.toLocaleString()}
            </p>
            <button className="mt-sm w-full font-body-sm text-body-sm text-primary border-[0.5px] border-primary rounded-lg py-[4px] hover:bg-primary hover:text-on-primary transition-colors duration-200">
              Withdraw
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 ml-[200px] flex flex-col overflow-hidden bg-background">

        {/* Top Bar */}
        <header className="h-[64px] flex items-center justify-between px-lg border-b-[0.5px] border-outline-variant bg-surface shrink-0 z-30">
          <h2 className="font-body-lg text-body-lg text-on-background capitalize">
            {navItems.find((n) => n.id === activeNav)?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-md">
            <button
              onClick={handleLogOut}
              className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-xs font-label-xs text-label-xs"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>logout</span>
            </button>
            <div className="h-6 w-[0.5px] bg-outline-variant" />
            <div className="flex items-center gap-sm">
              <div className="text-right hidden sm:block">
                <p className="font-body-sm text-body-sm text-on-background font-medium">{displayName}</p>
                <p className="font-label-xs text-label-xs text-on-surface-variant">{username}</p>
              </div>
              <AvatarFallback name={displayName} imageUrl={avatarUrl} size={40} />
            </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-xl">
          <div className="max-w-[1280px] mx-auto space-y-xl">

            {/* Error banner */}
            {dataError && (
              <div className="p-sm bg-error-container text-on-error-container rounded-lg text-sm flex items-center justify-between">
                <span>{dataError}</span>
                <button onClick={loadDashboard} className="font-bold underline ml-md">Retry</button>
              </div>
            )}

            {/* ─── DASHBOARD ─── */}
            {activeNav === "dashboard" && (
              <>
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-background">Good to see you, {displayName} 👋</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Here&apos;s what&apos;s happening with your store.</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
                  {[
                    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: "account_balance_wallet", trend: "+12% this week" },
                    { label: "New Orders", value: stats.totalOrders.toString(), icon: "shopping_bag", trend: `${orders.length} recent` },
                    { label: "Video Views", value: stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(), icon: "visibility", trend: `${stats.totalLikes} likes` },
                    { label: "Live Crafts", value: stats.liveCount.toString(), icon: "storefront", trend: `${listings.length} total` },
                  ].map((card) => (
                    <div key={card.label} className="bg-surface p-md rounded-lg border-[0.5px] border-outline-variant flex flex-col">
                      <div className="flex items-center justify-between">
                        <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">{card.label}</p>
                        <span className="material-symbols-outlined text-outline" style={{ fontSize: "20px" }}>{card.icon}</span>
                      </div>
                      {loadingData ? (
                        <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse mt-md" />
                      ) : (
                        <p className="font-price-lg text-price-lg text-on-background mt-md">{card.value}</p>
                      )}
                      <p className="font-label-xs text-label-xs text-primary mt-xs">{card.trend}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                  <div className="lg:col-span-2 space-y-xl">
                    {/* Upload CTA */}
                    <div
                      onClick={() => setActiveNav("add")}
                      className="border-[0.5px] border-dashed border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center mb-md group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined">upload</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-background font-medium">Upload New Product</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Images &amp; videos — goes live immediately</p>
                      <button className="mt-md bg-primary text-on-primary font-body-sm text-body-sm px-lg py-sm rounded-lg hover:opacity-90 transition-opacity active:scale-95">
                        Add Craft Listing
                      </button>
                    </div>

                    {/* Recent listings */}
                    <div>
                      <div className="flex items-center justify-between mb-md">
                        <h3 className="font-body-lg text-body-lg font-medium text-on-background">Recent Listings</h3>
                        <button onClick={() => setActiveNav("videos")} className="font-body-sm text-body-sm text-primary hover:underline">View All</button>
                      </div>
                      {loadingData ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                          {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-surface-container-high rounded-lg animate-pulse" />)}
                        </div>
                      ) : listings.length === 0 ? (
                        <div className="text-center py-xl text-on-surface-variant font-body-sm">No listings yet. Add your first craft!</div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                          {listings.slice(0, 3).map((item) => (
                            <div key={item._id} className="bg-surface border-[0.5px] border-outline-variant rounded-lg overflow-hidden group cursor-pointer">
                              <div className="relative h-32 w-full bg-surface-variant overflow-hidden">
                                <img alt={item.title} src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                {statusBadge(item.status)}
                                <div className="absolute bottom-xs left-xs right-xs px-sm">
                                  <p className="font-price-md text-price-md text-white">₹{item.price.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="p-sm">
                                <p className="font-body-sm text-body-sm text-on-background truncate">{item.title}</p>
                                <p className="font-label-xs text-label-xs text-on-surface-variant mt-[2px]">
                                  {item.viewsCount > 0 ? `${item.viewsCount >= 1000 ? (item.viewsCount / 1000).toFixed(1) + "k" : item.viewsCount} views` : "0 views"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent orders panel */}
                  <div>
                    <div className="bg-surface border-[0.5px] border-outline-variant rounded-lg p-md">
                      <div className="flex items-center justify-between mb-md pb-xs border-b-[0.5px] border-outline-variant">
                        <h3 className="font-body-md text-body-md font-medium text-on-background">Recent Orders</h3>
                        <button onClick={() => setActiveNav("orders")} className="text-primary hover:opacity-80">
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_forward</span>
                        </button>
                      </div>
                      {loadingData ? (
                        <div className="space-y-sm">
                          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-surface-container-high rounded animate-pulse" />)}
                        </div>
                      ) : orders.length === 0 ? (
                        <p className="text-center text-on-surface-variant font-body-sm py-md">No orders yet.</p>
                      ) : (
                        <div className="space-y-sm">
                          {orders.map((order) => (
                            <div key={order._id} className="flex items-center justify-between py-xs border-b-[0.5px] border-outline-variant last:border-0">
                              <div className="flex items-center gap-sm">
                                <div className="w-10 h-10 bg-surface-variant rounded border-[0.5px] border-outline-variant overflow-hidden shrink-0">
                                  {order.productId?.imageUrl && (
                                    <img alt="product" src={order.productId.imageUrl} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-body-sm text-body-sm text-on-background truncate max-w-[120px]">
                                    {order.productId?.title?.slice(0, 16) || "Order"}...
                                  </p>
                                  <p className="font-label-xs text-label-xs text-on-surface-variant">{order._id.slice(-6)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-price-md text-price-md text-on-background">₹{order.amount.toLocaleString()}</p>
                                {orderBadge(order.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ─── MY LISTINGS ─── */}
            {activeNav === "videos" && (
              <div>
                <div className="flex items-center justify-between mb-lg">
                  <h2 className="font-headline-md text-headline-md text-on-background">My Craft Listings</h2>
                  <button onClick={() => setActiveNav("add")} className="flex items-center gap-xs bg-primary text-on-primary font-body-sm text-body-sm px-md py-sm rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span> Add Craft
                  </button>
                </div>
                {loadingData ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 bg-surface-container-high rounded-lg animate-pulse" />)}
                  </div>
                ) : listings.length === 0 ? (
                  <div className="flex flex-col items-center py-huge text-center">
                    <span className="material-symbols-outlined text-outline-variant mb-md" style={{ fontSize: "64px" }}>storefront</span>
                    <p className="font-body-lg text-body-lg text-on-surface font-medium">No crafts listed yet</p>
                    <button onClick={() => setActiveNav("add")} className="mt-md bg-primary text-on-primary px-lg py-sm rounded-lg font-body-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
                      Create First Listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                    {listings.map((item) => (
                      <div key={item._id} className="bg-surface border-[0.5px] border-outline-variant rounded-lg overflow-hidden group">
                        <div className="relative h-40 bg-surface-variant overflow-hidden">
                          <img alt={item.title} src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {statusBadge(item.status)}
                          <div className="absolute bottom-xs left-xs">
                            <p className="font-price-md text-price-md text-white">₹{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="p-sm flex flex-col gap-xs">
                          <p className="font-body-sm text-body-sm text-on-background line-clamp-1 font-medium">{item.title}</p>
                          <p className="font-label-xs text-label-xs text-on-surface-variant capitalize">{item.category} • {item.viewsCount} views</p>
                          <div className="flex items-center justify-between pt-xs border-t border-outline-variant/20">
                            <span className="font-price-md text-price-md text-primary font-bold text-[13px]">₹{item.price.toLocaleString()}</span>
                            <button onClick={() => handleDeleteListing(item._id)} className="p-xs text-error hover:bg-error/5 rounded-full transition-colors active:scale-90">
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── ORDERS ─── */}
            {activeNav === "orders" && (
              <div>
                <h2 className="font-headline-md text-headline-md text-on-background mb-lg">Orders</h2>
                {loadingData ? (
                  <div className="space-y-sm">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface-container-high rounded-lg animate-pulse" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-huge text-on-surface-variant">No orders yet.</div>
                ) : (
                  <div className="bg-surface border-[0.5px] border-outline-variant rounded-lg overflow-hidden">
                    {orders.map((order, idx) => (
                      <div key={order._id} className={`flex items-center justify-between p-md ${idx !== orders.length - 1 ? "border-b-[0.5px] border-outline-variant" : ""}`}>
                        <div className="flex items-center gap-md">
                          <div className="w-12 h-12 bg-surface-variant rounded border-[0.5px] border-outline-variant overflow-hidden shrink-0">
                            {order.productId?.imageUrl && <img alt="product" src={order.productId.imageUrl} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-body-sm text-body-sm text-on-background font-medium">{order.productId?.title || "Product"}</p>
                            <p className="font-label-xs text-label-xs text-on-surface-variant">Order #{order._id.slice(-8)} • Qty {order.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-price-md text-price-md text-on-background font-bold">₹{order.amount.toLocaleString()}</p>
                          {orderBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── ADD CRAFT ─── */}
            {activeNav === "add" && (
              <div className="max-w-[500px] mx-auto relative" style={{ minHeight: "600px" }}>
                <UploadWizard
                  onPublish={(item) => handlePublish(item)}
                  onClose={() => setActiveNav("dashboard")}
                />
              </div>
            )}

            {/* ─── SETTINGS ─── */}
            {activeNav === "settings" && (
              <div className="max-w-md mx-auto flex flex-col gap-lg">
                <h2 className="font-headline-md text-headline-md text-on-background">Account</h2>
                <div className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex items-center gap-md">
                  <AvatarFallback name={displayName} imageUrl={avatarUrl} size={56} />
                  <div>
                    <p className="font-body-md text-body-md font-bold text-on-surface">{displayName}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{userEmail}</p>
                  </div>
                </div>
                <Link
                  href="/settings"
                  className="h-[44px] rounded-lg border border-outline-variant text-on-surface flex items-center justify-center gap-xs font-body-sm hover:bg-surface-container transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Account Settings
                </Link>
                <button
                  onClick={handleLogOut}
                  className="h-[44px] rounded-lg border border-error text-error flex items-center justify-center gap-xs font-body-sm font-bold hover:bg-error/5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
