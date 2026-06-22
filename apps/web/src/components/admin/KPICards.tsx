"use client";

import React from "react";

interface KPICardsProps {
  stats: {
    totalUsers: number;
    activeSellers: number;
    pendingSellers: number;
    ordersTodayCount: number;
    gmvToday: number;
    flaggedItemsCount: number;
  };
}

export default function KPICards({ stats }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl animate-[fadeInUp_0.5s_ease-out]">
      {/* Total Users */}
      <div className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex flex-col gap-xs hover:bg-surface-container-lowest transition-colors">
        <div className="flex justify-between items-center">
          <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
            Total users
          </span>
          <span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-label-xs text-[10px] font-medium whitespace-nowrap">
            ↑ 12% this week
          </span>
        </div>
        <div className="font-price-lg text-price-lg text-on-surface mt-1 font-bold select-all">
          {stats.totalUsers.toLocaleString()}
        </div>
        <span className="font-label-xs text-label-xs text-on-surface-variant mt-auto">
          342 new this month
        </span>
      </div>

      {/* Active Sellers */}
      <div className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex flex-col gap-xs hover:bg-surface-container-lowest transition-colors">
        <div className="flex justify-between items-center">
          <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
            Active sellers
          </span>
          <span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-label-xs text-[10px] font-medium whitespace-nowrap">
            ↑ 3 this week
          </span>
        </div>
        <div className="font-price-lg text-price-lg text-on-surface mt-1 font-bold select-all">
          {stats.activeSellers}
        </div>
        <span className="font-label-xs text-label-xs text-on-surface-variant mt-auto">
          {stats.pendingSellers} pending approval
        </span>
      </div>

      {/* Orders Today */}
      <div className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex flex-col gap-xs hover:bg-surface-container-lowest transition-colors">
        <div className="flex justify-between items-center">
          <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
            Orders today
          </span>
          <span className="bg-surface-container text-on-surface-variant rounded-full px-2 py-0.5 font-label-xs text-[10px] font-medium whitespace-nowrap">
            vs 39 yesterday
          </span>
        </div>
        <div className="font-price-lg text-price-lg text-on-surface mt-1 font-bold select-all">
          {stats.ordersTodayCount}
        </div>
        <span className="font-label-xs text-label-xs text-on-surface-variant mt-auto font-medium text-primary">
          ₹{stats.gmvToday.toLocaleString()} GMV today
        </span>
      </div>

      {/* Flagged Items */}
      <div className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex flex-col gap-xs hover:bg-surface-container-lowest transition-colors">
        <div className="flex justify-between items-center">
          <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
            Flagged items
          </span>
          <span className={`rounded-full px-2 py-0.5 font-label-xs text-[10px] font-medium whitespace-nowrap ${
            stats.flaggedItemsCount > 0 ? "bg-red-100 text-red-700" : "bg-surface-container text-on-surface-variant"
          }`}>
            {stats.flaggedItemsCount > 0 ? "Needs attention" : "All clean"}
          </span>
        </div>
        <div className={`font-price-lg text-price-lg mt-1 font-bold select-all ${
          stats.flaggedItemsCount > 0 ? "text-error" : "text-on-surface"
        }`}>
          {stats.flaggedItemsCount}
        </div>
        <span className="font-label-xs text-label-xs text-on-surface-variant mt-auto">
          Review required
        </span>
      </div>
    </div>
  );
}
