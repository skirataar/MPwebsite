"use client";

import React from "react";

interface MobileBottomNavProps {
  activeTab: "sellers" | "products" | "orders" | "accounts" | "flags";
  onTabChange: (tab: "sellers" | "products" | "orders" | "accounts" | "flags") => void;
}

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-xs border-t-[0.5px] border-outline-variant pb-[env(safe-area-inset-bottom)]">
      {/* Admin / Dashboard */}
      <button
        onClick={() => onTabChange("sellers")}
        className={`flex flex-col items-center justify-center transition-colors group p-xs active:scale-95 duration-200 ${
          activeTab === "sellers" ? "text-primary font-medium" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span
          className="material-symbols-outlined w-6 h-6 mb-1"
          style={{ fontVariationSettings: activeTab === "sellers" ? "'FILL' 1" : "'FILL' 0" }}
        >
          admin_panel_settings
        </span>
        <span className="font-label-xs text-label-xs">Admin</span>
      </button>

      {/* Sellers */}
      <button
        onClick={() => onTabChange("sellers")}
        className={`flex flex-col items-center justify-center transition-colors group p-xs active:scale-95 duration-200 ${
          activeTab === "sellers" ? "text-primary font-medium" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span
          className="material-symbols-outlined w-6 h-6 mb-1"
          style={{ fontVariationSettings: activeTab === "sellers" ? "'FILL' 1" : "'FILL' 0" }}
        >
          store
        </span>
        <span className="font-label-xs text-label-xs">Sellers</span>
      </button>

      {/* Products */}
      <button
        onClick={() => onTabChange("products")}
        className={`flex flex-col items-center justify-center transition-colors group p-xs active:scale-95 duration-200 ${
          activeTab === "products" ? "text-primary font-medium" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span
          className="material-symbols-outlined w-6 h-6 mb-1"
          style={{ fontVariationSettings: activeTab === "products" ? "'FILL' 1" : "'FILL' 0" }}
        >
          inventory_2
        </span>
        <span className="font-label-xs text-label-xs">Products</span>
      </button>

      {/* Orders */}
      <button
        onClick={() => onTabChange("orders")}
        className={`flex flex-col items-center justify-center transition-colors group p-xs active:scale-95 duration-200 ${
          activeTab === "orders" ? "text-primary font-medium" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span
          className="material-symbols-outlined w-6 h-6 mb-1"
          style={{ fontVariationSettings: activeTab === "orders" ? "'FILL' 1" : "'FILL' 0" }}
        >
          receipt_long
        </span>
        <span className="font-label-xs text-label-xs">Orders</span>
      </button>
    </nav>
  );
}
