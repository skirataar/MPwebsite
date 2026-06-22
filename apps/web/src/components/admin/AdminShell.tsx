"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminTopBar from "./AdminTopBar";
import AdminSidebar from "./AdminSidebar";
import AlertBanner from "./AlertBanner";
import KPICards from "./KPICards";
import SellersTab from "./SellersTab";
import ProductsTab from "./ProductsTab";
import OrdersTab from "./OrdersTab";
import AccountsTab from "./AccountsTab";
import FeatureFlags from "./FeatureFlags";
import MobileBottomNav from "./MobileBottomNav";

type TabType = "sellers" | "products" | "orders" | "accounts" | "flags";

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState<TabType>("sellers");
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Backend state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSellers: 0,
    pendingSellers: 0,
    ordersTodayCount: 0,
    gmvToday: 0,
    flaggedItemsCount: 0,
  });
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [flags, setFlags] = useState([]);

  // Fetch all backend data
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, sellersRes, productsRes, ordersRes, accountsRes, flagsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/sellers"),
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/accounts"),
        fetch("/api/admin/flags"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) setStats(data.stats);
      }
      if (sellersRes.ok) {
        const data = await sellersRes.json();
        if (data.success) setSellers(data.sellers);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        if (data.success) setProducts(data.products);
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data.success) setOrders(data.orders);
      }
      if (accountsRes.ok) {
        const data = await accountsRes.json();
        if (data.success) setAccounts(data.accounts);
      }
      if (flagsRes.ok) {
        const data = await flagsRes.json();
        if (data.success) setFlags(data.flags);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived pending count for notification/badges
  const pendingSellersCount = sellers.filter((s: any) => s.status === "PENDING").length;
  const pendingProductsCount = products.filter((p: any) => p.status === "REVIEW").length;

  const renderTabContent = () => {
    switch (activeTab) {
      case "sellers":
        return <SellersTab sellers={sellers} onActionComplete={fetchData} />;
      case "products":
        return (
          <ProductsTab
            products={products}
            searchQuery={searchQuery}
            onActionComplete={fetchData}
          />
        );
      case "orders":
        return (
          <OrdersTab
            orders={orders}
            searchQuery={searchQuery}
            onActionComplete={fetchData}
          />
        );
      case "accounts":
        return <AccountsTab accounts={accounts} onActionComplete={fetchData} />;
      case "flags":
        return <FeatureFlags flags={flags} onToggleComplete={fetchData} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-md">
        <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
          Connecting to database...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      {/* Top Navigation */}
      <AdminTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Side Navigation (Desktop) */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Layout */}
      <main className="pt-[80px] md:pl-64 min-h-screen pb-xxl px-md md:px-xl max-w-[1280px] mx-auto w-full transition-all duration-300">
        
        {/* Header Section */}
        <header className="mb-xl mt-md animate-[fadeInUp_0.3s_ease-out]">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs font-bold">
            Admin Review
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
            Manage platform applications and content compliance.
          </p>
        </header>

        {/* 4 KPI Stats Cards Row */}
        <KPICards stats={stats} />

        {/* Dismissible Alert Banner */}
        {!alertDismissed && (pendingSellersCount > 0 || pendingProductsCount > 0) && (
          <AlertBanner
            pendingSellersCount={pendingSellersCount}
            pendingProductsCount={pendingProductsCount}
            onDismiss={() => setAlertDismissed(true)}
            onReviewClick={() => setActiveTab("sellers")}
          />
        )}

        {/* Tab Navigation Menu Row */}
        <div className="border-b-[0.5px] border-outline-variant mb-xl animate-[fadeInUp_0.4s_ease-out] flex overflow-x-auto no-scrollbar">
          <nav className="-mb-[0.5px] flex space-x-lg">
            {/* Tab: Pending Sellers */}
            <button
              onClick={() => setActiveTab("sellers")}
              className={`whitespace-nowrap pb-sm px-xs border-b-2 font-body-sm text-body-sm font-medium transition-colors flex items-center gap-2 active:scale-95 duration-200 ${
                activeTab === "sellers"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
              }`}
            >
              Pending sellers
              <span
                className={`px-1.5 py-0.5 rounded-full font-label-xs text-label-xs ${
                  activeTab === "sellers"
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {pendingSellersCount}
              </span>
            </button>

            {/* Tab: Pending Products */}
            <button
              onClick={() => setActiveTab("products")}
              className={`whitespace-nowrap pb-sm px-xs border-b-2 font-body-sm text-body-sm font-medium transition-colors flex items-center gap-2 active:scale-95 duration-200 ${
                activeTab === "products"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
              }`}
            >
              Pending products
              <span
                className={`px-1.5 py-0.5 rounded-full font-label-xs text-label-xs ${
                  activeTab === "products"
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {pendingProductsCount}
              </span>
            </button>

            {/* Tab: Orders */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`whitespace-nowrap pb-sm px-xs border-b-2 font-body-sm text-body-sm font-medium transition-colors active:scale-95 duration-200 ${
                activeTab === "orders"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
              }`}
            >
              All orders
            </button>

            {/* Tab: Accounts */}
            <button
              onClick={() => setActiveTab("accounts")}
              className={`whitespace-nowrap pb-sm px-xs border-b-2 font-body-sm text-body-sm font-medium transition-colors active:scale-95 duration-200 ${
                activeTab === "accounts"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
              }`}
            >
              Accounts
            </button>

            {/* Tab: Feature Flags */}
            <button
              onClick={() => setActiveTab("flags")}
              className={`whitespace-nowrap pb-sm px-xs border-b-2 font-body-sm text-body-sm font-medium transition-colors active:scale-95 duration-200 ${
                activeTab === "flags"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
              }`}
            >
              Feature flags
            </button>
          </nav>
        </div>

        {/* Tab View Container */}
        <div className="pb-xxl">{renderTabContent()}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
