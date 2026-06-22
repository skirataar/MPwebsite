"use client";

import React, { useState } from "react";

interface SellerInfo {
  name: string;
  storeName?: string;
  username: string;
  avatarUrl?: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  mrp?: number;
  stock: number;
  category: string;
  imageUrl: string;
  status: string;
  sellerId?: SellerInfo;
}

interface ProductsTabProps {
  products: Product[];
  searchQuery: string;
  onActionComplete: () => void;
}

type FilterStatus = "all" | "LIVE" | "REVIEW" | "REJECTED";

export default function ProductsTab({ products, searchQuery, onActionComplete }: ProductsTabProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (productId: string, status: "LIVE" | "REVIEW" | "REJECTED") => {
    setLoadingId(productId);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, status }),
      });
      if (res.ok) {
        onActionComplete();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update product status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating product status");
    } finally {
      setLoadingId(null);
    }
  };

  // 1. Filter by Status Tab
  let filtered = products;
  if (activeFilter !== "all") {
    filtered = products.filter((p) => p.status === activeFilter);
  }

  // 2. Filter by Search Query (title or seller name)
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sellerId?.name && p.sellerId.name.toLowerCase().includes(q)) ||
        (p.sellerId?.storeName && p.sellerId.storeName.toLowerCase().includes(q))
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <span className="bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Live
          </span>
        );
      case "REVIEW":
        return (
          <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Under review
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Flagged
          </span>
        );
      default:
        return (
          <span className="bg-surface-container text-on-surface-variant rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const renderStock = (stock: number) => {
    if (stock === 0) {
      return <span className="text-error font-label-xs text-[11px] font-medium">Out of stock</span>;
    }
    if (stock <= 5) {
      return <span className="text-amber-600 font-label-xs text-[11px] font-medium">{stock} left</span>;
    }
    return <span className="text-on-surface font-label-xs text-[11px]">{stock}</span>;
  };

  return (
    <section className="animate-[fadeInUp_0.5s_ease-out]">
      {/* Sub Filter Navigation */}
      <div className="border-b-[0.5px] border-outline-variant mb-md flex overflow-x-auto no-scrollbar">
        <nav className="-mb-[0.5px] flex space-x-lg">
          {(["all", "LIVE", "REVIEW", "REJECTED"] as const).map((filter) => {
            const count =
              filter === "all"
                ? products.length
                : products.filter((p) => p.status === filter).length;
            const label =
              filter === "all"
                ? "All"
                : filter === "LIVE"
                ? "Live"
                : filter === "REVIEW"
                ? "Under review"
                : "Flagged";

            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap pb-sm px-xs border-b-2 font-body-sm text-body-sm font-medium transition-colors flex items-center gap-2 active:scale-95 duration-200 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                }`}
              >
                {label}
                <span
                  className={`px-1.5 py-0.5 rounded-full font-label-xs text-label-xs ${
                    isActive
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-xxl bg-surface border-[0.5px] border-outline-variant rounded-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-huge text-outline-variant">
            inventory
          </span>
          <p className="font-body-md text-body-md mt-sm">No products found matching filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-surface border-[0.5px] border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b-[0.5px] border-outline-variant text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  <th className="py-sm px-md font-label-xs">Product</th>
                  <th className="py-sm px-md font-label-xs">Seller</th>
                  <th className="py-sm px-md font-label-xs">Category</th>
                  <th className="py-sm px-md font-label-xs">Price</th>
                  <th className="py-sm px-md font-label-xs">Stock</th>
                  <th className="py-sm px-md font-label-xs">Status</th>
                  <th className="py-sm px-md font-label-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-outline-variant/60">
                {filtered.map((prod) => (
                  <tr
                    key={prod._id}
                    className="hover:bg-surface-container-low transition-colors duration-150 text-body-sm text-on-surface"
                  >
                    <td className="py-sm px-md">
                      <div className="flex items-center gap-sm max-w-xs">
                        <img
                          alt={prod.title}
                          className="w-10 h-10 rounded object-cover border-[0.5px] border-outline-variant shrink-0"
                          src={prod.imageUrl}
                        />
                        <span className="font-medium text-on-surface line-clamp-2 select-all leading-snug">
                          {prod.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-sm px-md text-on-surface-variant font-medium">
                      {prod.sellerId?.storeName || prod.sellerId?.name || "Artisan"}
                    </td>
                    <td className="py-sm px-md text-on-surface-variant">{prod.category}</td>
                    <td className="py-sm px-md font-price-md font-semibold select-all">
                      ₹{prod.price.toLocaleString()}
                    </td>
                    <td className="py-sm px-md">{renderStock(prod.stock)}</td>
                    <td className="py-sm px-md">{getStatusBadge(prod.status)}</td>
                    <td className="py-sm px-md text-right">
                      <div className="flex gap-xs justify-end items-center">
                        {prod.status === "LIVE" && (
                          <>
                            <a
                              href={`/product/${prod._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="h-7 px-sm rounded-lg flex items-center justify-center text-primary font-medium text-label-xs hover:bg-primary-container/20 active:scale-95 duration-200"
                            >
                              View
                            </a>
                            <button
                              disabled={loadingId === prod._id}
                              onClick={() => handleStatusChange(prod._id, "REJECTED")}
                              className="h-7 px-sm rounded-lg border-[0.5px] border-error text-error bg-transparent hover:bg-error-container font-medium text-label-xs active:scale-95 duration-200 disabled:opacity-50"
                            >
                              Flag
                            </button>
                          </>
                        )}
                        {prod.status === "REVIEW" && (
                          <>
                            <button
                              disabled={loadingId === prod._id}
                              onClick={() => handleStatusChange(prod._id, "LIVE")}
                              className="h-7 px-sm rounded-lg bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-medium text-label-xs active:scale-95 duration-200 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={loadingId === prod._id}
                              onClick={() => handleStatusChange(prod._id, "REJECTED")}
                              className="h-7 px-sm rounded-lg border-[0.5px] border-error text-error bg-transparent hover:bg-error-container font-medium text-label-xs active:scale-95 duration-200 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {prod.status === "REJECTED" && (
                          <>
                            <button
                              disabled={loadingId === prod._id}
                              onClick={() => handleStatusChange(prod._id, "LIVE")}
                              className="h-7 px-sm rounded-lg bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-medium text-label-xs active:scale-95 duration-200 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={loadingId === prod._id}
                              onClick={() => handleStatusChange(prod._id, "REVIEW")}
                              className="h-7 px-sm rounded-lg bg-secondary text-white hover:opacity-85 font-medium text-label-xs active:scale-95 duration-200 disabled:opacity-50"
                            >
                              Reset
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card stack view */}
          <div className="block md:hidden flex flex-col gap-md">
            {filtered.map((prod) => (
              <div
                key={prod._id}
                className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex flex-col gap-sm hover:bg-surface-container-lowest transition-colors"
              >
                <div className="flex gap-sm items-start">
                  <img
                    alt={prod.title}
                    className="w-16 h-16 rounded object-cover border-[0.5px] border-outline-variant shrink-0"
                    src={prod.imageUrl}
                  />
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-body-md text-body-md font-medium text-on-surface line-clamp-2 leading-snug">
                      {prod.title}
                    </h4>
                    <span className="font-label-xs text-label-xs text-on-surface-variant mt-1 font-medium">
                      Seller: {prod.sellerId?.storeName || prod.sellerId?.name || "Artisan"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-xs">
                  <div className="bg-surface-container-low rounded p-xs text-center">
                    <p className="font-label-xs text-label-xs text-on-surface-variant mb-0.5">Price</p>
                    <p className="font-price-md text-[13px] text-on-surface font-semibold">
                      ₹{prod.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded p-xs text-center">
                    <p className="font-label-xs text-label-xs text-on-surface-variant mb-0.5">Stock</p>
                    <p className="font-label-xs text-[13px]">{renderStock(prod.stock)}</p>
                  </div>
                  <div className="bg-surface-container-low rounded p-xs flex items-center justify-center">
                    {getStatusBadge(prod.status)}
                  </div>
                </div>

                <div className="flex gap-sm justify-end border-t-[0.5px] border-outline-variant/60 pt-sm mt-xs">
                  {prod.status === "LIVE" && (
                    <>
                      <a
                        href={`/product/${prod._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1 px-sm rounded-lg flex items-center justify-center text-primary font-medium text-body-sm hover:bg-primary-container/20 active:scale-95 duration-200"
                      >
                        View
                      </a>
                      <button
                        disabled={loadingId === prod._id}
                        onClick={() => handleStatusChange(prod._id, "REJECTED")}
                        className="py-1 px-md rounded-lg border-[0.5px] border-error text-error bg-transparent hover:bg-error-container font-medium text-body-sm active:scale-95 duration-200 disabled:opacity-50"
                      >
                        Flag
                      </button>
                    </>
                  )}
                  {prod.status === "REVIEW" && (
                    <>
                      <button
                        disabled={loadingId === prod._id}
                        onClick={() => handleStatusChange(prod._id, "REJECTED")}
                        className="py-1 px-md rounded-lg border-[0.5px] border-error text-error bg-transparent hover:bg-error-container font-medium text-body-sm active:scale-95 duration-200 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        disabled={loadingId === prod._id}
                        onClick={() => handleStatusChange(prod._id, "LIVE")}
                        className="py-1 px-md rounded-lg bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-medium text-body-sm border-[0.5px] border-primary active:scale-95 duration-200 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </>
                  )}
                  {prod.status === "REJECTED" && (
                    <>
                      <button
                        disabled={loadingId === prod._id}
                        onClick={() => handleStatusChange(prod._id, "REVIEW")}
                        className="py-1 px-md rounded-lg bg-secondary text-white hover:opacity-85 font-medium text-body-sm active:scale-95 duration-200 disabled:opacity-50"
                      >
                        Reset
                      </button>
                      <button
                        disabled={loadingId === prod._id}
                        onClick={() => handleStatusChange(prod._id, "LIVE")}
                        className="py-1 px-md rounded-lg bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-medium text-body-sm border-[0.5px] border-primary active:scale-95 duration-200 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
