"use client";

import React, { useState } from "react";

interface Account {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  storeName?: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
}

interface AccountsTabProps {
  accounts: Account[];
  onActionComplete: () => void;
}

export default function AccountsTab({ accounts, onActionComplete }: AccountsTabProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (accountId: string, status: "ACTIVE" | "SUSPENDED" | "REJECTED") => {
    setLoadingId(accountId);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, status }),
      });
      if (res.ok) {
        onActionComplete();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update account status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating account status");
    } finally {
      setLoadingId(null);
    }
  };

  // Filter accounts client-side for real-time responsiveness
  const filtered = accounts.filter((acc) => {
    const q = localSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (acc.name && acc.name.toLowerCase().includes(q)) ||
      (acc.phone && acc.phone.toLowerCase().includes(q)) ||
      (acc.email && acc.email.toLowerCase().includes(q)) ||
      (acc.storeName && acc.storeName.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Pending
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Suspended
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Rejected
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

  const getRoleBadge = (role: string) => {
    if (role === "SELLER") {
      return (
        <span className="bg-primary-container/30 text-primary rounded-full px-2 py-0.5 label-xs font-semibold whitespace-nowrap">
          Seller
        </span>
      );
    }
    if (role === "ADMIN") {
      return (
        <span className="bg-tertiary-fixed text-tertiary-fixed-dim rounded-full px-2 py-0.5 label-xs font-semibold whitespace-nowrap bg-purple-100 text-purple-800">
          Admin
        </span>
      );
    }
    return (
      <span className="bg-surface-container text-on-surface-variant rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
        Buyer
      </span>
    );
  };

  return (
    <section className="animate-[fadeInUp_0.5s_ease-out]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-md">
        <h2 className="font-body-lg text-body-lg text-on-surface font-medium">User accounts</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full border-[0.5px] border-outline-variant rounded-full px-sm py-1.5 pl-xl text-body-sm focus:outline-none focus:border-primary bg-surface text-on-surface"
          />
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] select-none">
            search
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-xxl bg-surface border-[0.5px] border-outline-variant rounded-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-huge text-outline-variant">
            group
          </span>
          <p className="font-body-md text-body-md mt-sm">No accounts match search query.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-surface border-[0.5px] border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b-[0.5px] border-outline-variant text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  <th className="py-sm px-md font-label-xs">User</th>
                  <th className="py-sm px-md font-label-xs">Role</th>
                  <th className="py-sm px-md font-label-xs">Phone</th>
                  <th className="py-sm px-md font-label-xs">Joined</th>
                  <th className="py-sm px-md font-label-xs">Status</th>
                  <th className="py-sm px-md font-label-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-outline-variant/60">
                {filtered.map((acc) => {
                  const initials = acc.name
                    ? acc.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
                    : "U";

                  return (
                    <tr
                      key={acc._id}
                      className="hover:bg-surface-container-low transition-colors duration-150 text-body-sm text-on-surface"
                    >
                      <td className="py-sm px-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high border-[0.5px] border-outline-variant flex items-center justify-center shrink-0 overflow-hidden">
                            {acc.avatarUrl ? (
                              <img
                                alt={acc.name}
                                className="w-full h-full object-cover"
                                src={acc.avatarUrl}
                              />
                            ) : (
                              <span className="font-label-xs text-label-xs font-semibold text-on-surface-variant select-none">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-on-surface select-all truncate">{acc.name || acc.email}</span>
                            {acc.role === "SELLER" && acc.storeName && (
                              <span className="text-[11px] text-primary font-medium truncate">
                                Store: {acc.storeName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-sm px-md">{getRoleBadge(acc.role)}</td>
                      <td className="py-sm px-md select-all text-on-surface-variant">{acc.phone || "—"}</td>
                      <td className="py-sm px-md text-on-surface-variant">
                        {new Date(acc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-sm px-md">{getStatusBadge(acc.status)}</td>
                      <td className="py-sm px-md text-right">
                        <div className="flex gap-xs justify-end items-center">
                          {acc.role === "BUYER" && acc.status === "ACTIVE" && (
                            <button
                              disabled={loadingId === acc._id}
                              onClick={() => handleUpdateStatus(acc._id, "SUSPENDED")}
                              className="h-7 px-sm rounded-lg border-[0.5px] border-error text-error text-label-xs font-medium active:scale-95 duration-200 hover:bg-error-container disabled:opacity-50"
                            >
                              Suspend
                            </button>
                          )}
                          {acc.role === "BUYER" && acc.status === "SUSPENDED" && (
                            <button
                              disabled={loadingId === acc._id}
                              onClick={() => handleUpdateStatus(acc._id, "ACTIVE")}
                              className="h-7 px-sm rounded-lg border-[0.5px] border-outline-variant text-on-surface text-label-xs font-medium active:scale-95 duration-200 hover:bg-surface-container disabled:opacity-50"
                            >
                              Unsuspend
                            </button>
                          )}
                          {acc.role === "SELLER" && acc.status === "ACTIVE" && (
                            <>
                              <button
                                disabled={loadingId === acc._id}
                                onClick={() => handleUpdateStatus(acc._id, "SUSPENDED")}
                                className="h-7 px-sm rounded-lg border-[0.5px] border-error text-error text-label-xs font-medium active:scale-95 duration-200 hover:bg-error-container disabled:opacity-50"
                              >
                                Suspend
                              </button>
                              <a
                                href={`/seller/studio/${acc._id}`}
                                className="h-7 px-sm rounded-lg text-primary text-label-xs font-medium hover:underline flex items-center justify-center"
                              >
                                View
                              </a>
                            </>
                          )}
                          {acc.role === "SELLER" && acc.status === "SUSPENDED" && (
                            <button
                              disabled={loadingId === acc._id}
                              onClick={() => handleUpdateStatus(acc._id, "ACTIVE")}
                              className="h-7 px-sm rounded-lg border-[0.5px] border-outline-variant text-on-surface text-label-xs font-medium active:scale-95 duration-200 hover:bg-surface-container disabled:opacity-50"
                            >
                              Unsuspend
                            </button>
                          )}
                          {acc.role === "SELLER" && acc.status === "PENDING" && (
                            <>
                              <button
                                disabled={loadingId === acc._id}
                                onClick={() => handleUpdateStatus(acc._id, "ACTIVE")}
                                className="h-7 px-sm bg-primary text-on-primary rounded-lg text-label-xs font-medium active:scale-95 duration-200 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                disabled={loadingId === acc._id}
                                onClick={() => handleUpdateStatus(acc._id, "REJECTED")}
                                className="h-7 px-sm border-[0.5px] border-error text-error rounded-lg text-label-xs font-medium active:scale-95 duration-200 hover:bg-error-container disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {acc.status === "REJECTED" && <span className="text-on-surface-variant select-none px-sm">—</span>}
                          {acc.role === "ADMIN" && <span className="text-on-surface-variant select-none px-sm">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card stack view */}
          <div className="block md:hidden flex flex-col gap-md">
            {filtered.map((acc) => {
              const initials = acc.name
                ? acc.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
                : "U";

              return (
                <div
                  key={acc._id}
                  className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex flex-col gap-sm hover:bg-surface-container-lowest transition-colors"
                >
                  <div className="flex gap-sm items-center">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border-[0.5px] border-outline-variant flex items-center justify-center shrink-0 overflow-hidden">
                      {acc.avatarUrl ? (
                        <img
                          alt={acc.name}
                          className="w-full h-full object-cover"
                          src={acc.avatarUrl}
                        />
                      ) : (
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface-variant select-none">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-body-md text-body-md font-medium text-on-surface truncate select-all">
                        {acc.name || acc.email}
                      </h4>
                      <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">
                        {acc.phone || "No phone"} • {getRoleBadge(acc.role)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t-[0.5px] border-outline-variant/60 pt-sm mt-xs">
                    {getStatusBadge(acc.status)}
                    <div className="flex gap-xs">
                      {acc.role === "BUYER" && acc.status === "ACTIVE" && (
                        <button
                          disabled={loadingId === acc._id}
                          onClick={() => handleUpdateStatus(acc._id, "SUSPENDED")}
                          className="py-1 px-sm rounded-lg border-[0.5px] border-error text-error text-body-sm font-medium active:scale-95 duration-200 hover:bg-error-container disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {acc.role === "BUYER" && acc.status === "SUSPENDED" && (
                        <button
                          disabled={loadingId === acc._id}
                          onClick={() => handleUpdateStatus(acc._id, "ACTIVE")}
                          className="py-1 px-sm rounded-lg border-[0.5px] border-outline-variant text-on-surface text-body-sm font-medium active:scale-95 duration-200 disabled:opacity-50"
                        >
                          Unsuspend
                        </button>
                      )}
                      {acc.role === "SELLER" && acc.status === "ACTIVE" && (
                        <>
                          <button
                            disabled={loadingId === acc._id}
                            onClick={() => handleUpdateStatus(acc._id, "SUSPENDED")}
                            className="py-1 px-sm rounded-lg border-[0.5px] border-error text-error text-body-sm font-medium active:scale-95 duration-200 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                          <a
                            href={`/seller/studio/${acc._id}`}
                            className="py-1 px-sm text-primary text-body-sm font-medium hover:underline flex items-center"
                          >
                            View
                          </a>
                        </>
                      )}
                      {acc.role === "SELLER" && acc.status === "SUSPENDED" && (
                        <button
                          disabled={loadingId === acc._id}
                          onClick={() => handleUpdateStatus(acc._id, "ACTIVE")}
                          className="py-1 px-sm rounded-lg border-[0.5px] border-outline-variant text-on-surface text-body-sm font-medium active:scale-95 duration-200 disabled:opacity-50"
                        >
                          Unsuspend
                        </button>
                      )}
                      {acc.role === "SELLER" && acc.status === "PENDING" && (
                        <>
                          <button
                            disabled={loadingId === acc._id}
                            onClick={() => handleUpdateStatus(acc._id, "REJECTED")}
                            className="py-1 px-sm border-[0.5px] border-error text-error rounded-lg text-body-sm font-medium active:scale-95 duration-200 disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            disabled={loadingId === acc._id}
                            onClick={() => handleUpdateStatus(acc._id, "ACTIVE")}
                            className="py-1 px-sm bg-primary text-on-primary rounded-lg text-body-sm font-medium active:scale-95 duration-200 disabled:opacity-50 border-[0.5px] border-primary"
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
