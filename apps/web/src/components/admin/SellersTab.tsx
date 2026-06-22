"use client";

import React, { useState } from "react";

interface Seller {
  _id: string;
  name: string;
  username: string;
  storeName?: string;
  phone?: string;
  avatarUrl?: string;
  location?: string;
  category?: string;
  gstin?: string;
  documentIssue?: string;
  status: string;
  createdAt: string;
}

interface SellersTabProps {
  sellers: Seller[];
  onActionComplete: () => void;
}

export default function SellersTab({ sellers, onActionComplete }: SellersTabProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter to pending reviews only
  const pendingSellers = sellers.filter((s) => s.status === "PENDING");

  const handleStatusChange = async (sellerId: string, status: "ACTIVE" | "REJECTED") => {
    setLoadingId(sellerId);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, status }),
      });
      if (res.ok) {
        onActionComplete();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update seller status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating seller status");
    } finally {
      setLoadingId(null);
    }
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return "Just now";
      if (diffHrs === 1) return "1 hr ago";
      if (diffHrs < 24) return `${diffHrs} hrs ago`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return "1 day ago";
      return `${diffDays} days ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <section className="animate-[fadeInUp_0.5s_ease-out]">
      <div className="flex justify-between items-end mb-md">
        <h2 className="font-body-lg text-body-lg text-on-surface font-medium">
          Applications awaiting review
        </h2>
        <button className="font-body-sm text-body-sm text-primary hover:underline flex items-center gap-1 active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
        </button>
      </div>

      {pendingSellers.length === 0 ? (
        <div className="text-center py-xxl bg-surface border-[0.5px] border-outline-variant rounded-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-huge text-outline-variant">
            check_circle
          </span>
          <p className="font-body-md text-body-md mt-sm">All seller applications reviewed!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {pendingSellers.map((seller) => {
            const hasIssue = !!seller.documentIssue;
            const initials = seller.name
              ? seller.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)
              : "SE";

            return (
              <div
                key={seller._id}
                className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex flex-col hover:bg-surface-container-lowest transition-colors group"
              >
                {/* Header Info */}
                <div className="flex items-start justify-between mb-sm">
                  <div className="flex items-center gap-sm">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden border-[0.5px] border-outline-variant flex items-center justify-center shrink-0">
                      {seller.avatarUrl ? (
                        <img
                          alt={seller.storeName || seller.name}
                          className="w-full h-full object-cover"
                          src={seller.avatarUrl}
                        />
                      ) : (
                        <span className="font-headline-md text-headline-md text-on-surface-variant select-none">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-body-md text-body-md font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {seller.storeName || seller.name}
                      </h3>
                      <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">
                        {seller.category || "Handicrafts & Textiles"}
                      </p>
                    </div>
                  </div>
                  <span className="font-label-xs text-label-xs text-on-surface-variant whitespace-nowrap ml-xs">
                    {getRelativeTime(seller.createdAt)}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-xs mb-md flex-1">
                  <div className="bg-surface-container-low rounded p-xs">
                    <p className="font-label-xs text-label-xs text-on-surface-variant mb-0.5">GSTIN</p>
                    <p className="font-price-md text-[13px] text-on-surface select-all truncate">
                      {seller.gstin || "N/A"}
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded p-xs">
                    <p className="font-label-xs text-label-xs text-on-surface-variant mb-0.5">Contact</p>
                    <p className="font-price-md text-[13px] text-on-surface select-all truncate">
                      {seller.phone || "N/A"}
                    </p>
                  </div>

                  <div className="bg-surface-container-low rounded p-xs col-span-2 flex items-center gap-2 min-w-0">
                    {hasIssue ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] text-error shrink-0 select-none">
                          warning
                        </span>
                        <p className="font-body-sm text-[12px] text-error truncate">
                          {seller.documentIssue}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 select-none">
                          location_on
                        </span>
                        <p className="font-body-sm text-[12px] text-on-surface truncate">
                          {seller.location || "India"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-sm mt-auto pt-sm border-t-[0.5px] border-outline-variant">
                  <button
                    disabled={loadingId === seller._id}
                    onClick={() => handleStatusChange(seller._id, "REJECTED")}
                    className="flex-1 py-1.5 px-sm rounded-lg border-[0.5px] border-error text-error bg-transparent hover:bg-error-container hover:border-error transition-all font-body-sm text-body-sm text-center active:scale-95 duration-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    disabled={hasIssue || loadingId === seller._id}
                    onClick={() => handleStatusChange(seller._id, "ACTIVE")}
                    className={`flex-1 py-1.5 px-sm rounded-lg bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-all font-body-sm text-body-sm text-center border-[0.5px] border-primary active:scale-95 duration-200 ${
                      hasIssue ? "opacity-50 cursor-not-allowed" : "disabled:opacity-50"
                    }`}
                  >
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
