"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  activeTab: "sellers" | "products" | "orders" | "accounts" | "flags";
  onTabChange: (tab: "sellers" | "products" | "orders" | "accounts" | "flags") => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const handleLogout = async () => {
    localStorage.setItem("v-market-logged-in", "false");
    localStorage.removeItem("v-market-account-type");
    window.dispatchEvent(new Event("login-updated"));
    window.dispatchEvent(new Event("account-type-updated"));
    await signOut({ callbackUrl: "/" });
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-[65px] h-[calc(100vh-65px)] z-40 flex-col bg-surface border-r-[0.5px] border-outline-variant w-64 pt-lg pb-md">
      <div className="px-md mb-lg">
        <h2 className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider mb-sm px-xs select-none">
          Management
        </h2>
        <nav className="flex flex-col gap-1">
          {/* Dashboard (Active when on sellers tab or stats overview) */}
          <button
            onClick={() => onTabChange("sellers")}
            className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-colors group active:scale-95 duration-200 text-left ${
              activeTab === "sellers"
                ? "bg-primary-container text-on-primary-container font-medium"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined w-5 h-5 flex items-center justify-center">
              admin_panel_settings
            </span>
            <span className="font-body-sm text-body-sm">Dashboard</span>
          </button>

          {/* Sellers */}
          <button
            onClick={() => onTabChange("sellers")}
            className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-colors group active:scale-95 duration-200 text-left ${
              activeTab === "sellers"
                ? "bg-primary-container text-on-primary-container font-medium"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className={`material-symbols-outlined w-5 h-5 flex items-center justify-center ${
                activeTab !== "sellers" ? "group-hover:text-primary" : ""
              }`}
            >
              store
            </span>
            <span className="font-body-sm text-body-sm">Sellers</span>
          </button>

          {/* Products */}
          <button
            onClick={() => onTabChange("products")}
            className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-colors group active:scale-95 duration-200 text-left ${
              activeTab === "products"
                ? "bg-primary-container text-on-primary-container font-medium"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className={`material-symbols-outlined w-5 h-5 flex items-center justify-center ${
                activeTab !== "products" ? "group-hover:text-primary" : ""
              }`}
            >
              inventory_2
            </span>
            <span className="font-body-sm text-body-sm">Products</span>
          </button>

          {/* Orders */}
          <button
            onClick={() => onTabChange("orders")}
            className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-colors group active:scale-95 duration-200 text-left ${
              activeTab === "orders"
                ? "bg-primary-container text-on-primary-container font-medium"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className={`material-symbols-outlined w-5 h-5 flex items-center justify-center ${
                activeTab !== "orders" ? "group-hover:text-primary" : ""
              }`}
            >
              receipt_long
            </span>
            <span className="font-body-sm text-body-sm">Orders</span>
          </button>

          {/* Go to Store Feed */}
          <Link
            href="/"
            className="w-full flex items-center gap-md rounded-lg px-md py-sm transition-colors group active:scale-95 duration-200 text-left text-on-surface-variant hover:bg-surface-container border border-dashed border-outline-variant/40 mt-sm"
          >
            <span className="material-symbols-outlined w-5 h-5 flex items-center justify-center text-primary">
              storefront
            </span>
            <span className="font-body-sm text-body-sm font-semibold text-primary">View Store Feed</span>
          </Link>
        </nav>
      </div>

      <div className="mt-auto px-md">
        <hr className="border-t-[0.5px] border-outline-variant mb-md" />
        <nav className="flex flex-col gap-1">
          <Link
            className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container rounded-lg px-md py-sm transition-colors group active:scale-95 duration-200"
            href="/settings"
          >
            <span className="material-symbols-outlined w-5 h-5 flex items-center justify-center group-hover:text-primary">
              settings
            </span>
            <span className="font-body-sm text-body-sm">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-md text-on-surface-variant hover:bg-surface-container rounded-lg px-md py-sm transition-colors group active:scale-95 duration-200 text-left"
          >
            <span className="material-symbols-outlined w-5 h-5 flex items-center justify-center group-hover:text-error">
              logout
            </span>
            <span className="font-body-sm text-body-sm">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
