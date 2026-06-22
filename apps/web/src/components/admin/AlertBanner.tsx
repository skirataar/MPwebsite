"use client";

import React from "react";

interface AlertBannerProps {
  pendingSellersCount?: number;
  pendingProductsCount?: number;
  onDismiss: () => void;
  onReviewClick: () => void;
}

export default function AlertBanner({
  pendingSellersCount = 3,
  pendingProductsCount = 7,
  onDismiss,
  onReviewClick,
}: AlertBannerProps) {
  return (
    <div className="bg-amber-50 border-[0.5px] border-amber-200 rounded-xl p-md flex items-center justify-between gap-md mb-xl animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex items-center gap-xs text-amber-800">
        <span className="material-symbols-outlined text-amber-600 w-5 h-5 flex items-center justify-center select-none">
          warning
        </span>
        <span className="font-body-sm text-body-sm">
          {pendingSellersCount} {pendingSellersCount === 1 ? "seller" : "sellers"} and {pendingProductsCount} {pendingProductsCount === 1 ? "product is" : "products are"} awaiting your review
        </span>
      </div>
      <div className="flex items-center gap-md">
        <button
          onClick={onReviewClick}
          className="font-body-sm text-body-sm text-primary hover:underline font-medium active:scale-95 duration-200"
        >
          Review now
        </button>
        <button
          onClick={onDismiss}
          className="text-amber-600 hover:opacity-85 active:scale-95 duration-200 flex items-center justify-center p-0.5"
          aria-label="Dismiss alert"
        >
          <span className="material-symbols-outlined w-5 h-5 flex items-center justify-center select-none text-[20px]">
            close
          </span>
        </button>
      </div>
    </div>
  );
}
