"use client";

import React, { useState } from "react";

interface FeatureFlag {
  _id: string;
  key: string;
  description: string;
  value: boolean;
}

interface FeatureFlagsProps {
  flags: FeatureFlag[];
  onToggleComplete: () => void;
}

export default function FeatureFlags({ flags, onToggleComplete }: FeatureFlagsProps) {
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const handleToggle = async (key: string, currentValue: boolean) => {
    setTogglingKey(key);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: !currentValue }),
      });
      if (res.ok) {
        onToggleComplete();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update feature flag");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating feature flag");
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <section className="animate-[fadeInUp_0.5s_ease-out]">
      <div className="mb-lg">
        <h2 className="font-body-lg text-body-lg text-on-surface font-medium">Feature flags</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
          Toggle platform features without redeploying
        </p>
      </div>

      <div className="border-[0.5px] border-outline-variant rounded-xl overflow-hidden divide-y-[0.5px] divide-outline-variant/60">
        {flags.map((flag) => {
          const isToggling = togglingKey === flag.key;
          return (
            <div
              key={flag.key}
              className="bg-surface hover:bg-surface-container-lowest transition-colors duration-150 px-md py-sm flex items-center justify-between gap-md"
            >
              {/* Flag Details */}
              <div className="flex flex-col min-w-0">
                <span className="font-price-md text-[13px] text-on-surface font-semibold select-all font-mono">
                  {flag.key}
                </span>
                <span className="font-label-xs text-label-xs text-on-surface-variant mt-0.5 truncate max-w-xl">
                  {flag.description}
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                disabled={isToggling}
                onClick={() => handleToggle(flag.key, flag.value)}
                className={`relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer rounded-full border-transparent transition-colors duration-200 ease-in-out focus:outline-none select-none items-center ${
                  flag.value ? "bg-primary" : "bg-outline-variant"
                } ${isToggling ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-on-primary shadow ring-0 transition duration-200 ease-in-out ${
                    flag.value ? "translate-x-[20px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
