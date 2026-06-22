"use client";

import React, { useState } from "react";

interface BuyerInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface ProductInfo {
  _id: string;
  title: string;
  imageUrl: string;
  price: number;
}

interface SellerInfo {
  _id: string;
  name: string;
  storeName?: string;
  location?: string;
}

interface Order {
  _id: string;
  buyerId?: BuyerInfo;
  productId?: ProductInfo;
  sellerId?: SellerInfo;
  amount: number;
  quantity: number;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

interface OrdersTabProps {
  orders: Order[];
  searchQuery: string;
  onActionComplete: () => void;
}

export default function OrdersTab({ orders, searchQuery, onActionComplete }: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tempStatus, setTempStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setTempStatus(order.status);
  };

  const handleCloseDrawer = () => {
    setSelectedOrder(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          status: tempStatus,
        }),
      });

      if (res.ok) {
        onActionComplete();
        // Update selected order locally too
        setSelectedOrder({
          ...selectedOrder,
          status: tempStatus,
        });
        handleCloseDrawer();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    } finally {
      setSaving(false);
    }
  };

  // Filter orders by search query
  let filtered = orders;
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filtered = orders.filter(
      (o) =>
        (o.razorpayOrderId && o.razorpayOrderId.toLowerCase().includes(q)) ||
        (o.productId?.title && o.productId.title.toLowerCase().includes(q)) ||
        (o.buyerId?.name && o.buyerId.name.toLowerCase().includes(q)) ||
        (o.sellerId?.storeName && o.sellerId.storeName.toLowerCase().includes(q)) ||
        (o.sellerId?.name && o.sellerId.name.toLowerCase().includes(q))
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Pending
          </span>
        );
      case "CONFIRMED":
      case "PAID":
        return (
          <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Confirmed
          </span>
        );
      case "SHIPPED":
        return (
          <span className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Shipped
          </span>
        );
      case "DELIVERED":
        return (
          <span className="bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Delivered
          </span>
        );
      case "CANCELLED":
      case "FAILED":
        return (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Cancelled
          </span>
        );
      case "REFUNDED":
        return (
          <span className="bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 label-xs font-medium whitespace-nowrap">
            Refunded
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

  const getRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return "Just now";
      if (diffHrs === 1) return "1 hr ago";
      if (diffHrs < 24) return `${diffHrs} hrs ago`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <section className="animate-[fadeInUp_0.5s_ease-out] relative">
      <div className="flex justify-between items-end mb-md">
        <h2 className="font-body-lg text-body-lg text-on-surface font-medium">All orders</h2>
        <button className="font-body-sm text-body-sm text-primary hover:underline flex items-center gap-1 active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-xxl bg-surface border-[0.5px] border-outline-variant rounded-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-huge text-outline-variant">
            receipt_long
          </span>
          <p className="font-body-md text-body-md mt-sm">No orders found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-surface border-[0.5px] border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b-[0.5px] border-outline-variant text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  <th className="py-sm px-md font-label-xs">Order ID</th>
                  <th className="py-sm px-md font-label-xs">Product</th>
                  <th className="py-sm px-md font-label-xs">Buyer</th>
                  <th className="py-sm px-md font-label-xs">Seller</th>
                  <th className="py-sm px-md font-label-xs">Amount</th>
                  <th className="py-sm px-md font-label-xs">Status</th>
                  <th className="py-sm px-md font-label-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-outline-variant/60">
                {filtered.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => handleOpenDrawer(order)}
                    className="hover:bg-surface-container-low transition-colors duration-150 text-body-sm text-on-surface cursor-pointer"
                  >
                    <td className="py-sm px-md font-price-md font-medium text-on-surface-variant select-all text-[12px] uppercase">
                      {order.razorpayOrderId || `ORD-${order._id.substring(0, 4)}`}
                    </td>
                    <td className="py-sm px-md">
                      <span className="font-medium line-clamp-1">
                        {order.productId?.title || "Product details deleted"}
                      </span>
                    </td>
                    <td className="py-sm px-md text-on-surface-variant">
                      {order.buyerId?.name || "Customer"}
                    </td>
                    <td className="py-sm px-md text-on-surface-variant">
                      {order.sellerId?.storeName || order.sellerId?.name || "Artisan"}
                    </td>
                    <td className="py-sm px-md font-price-md font-semibold select-all">
                      ₹{order.amount.toLocaleString()}
                    </td>
                    <td className="py-sm px-md">{getStatusBadge(order.status)}</td>
                    <td className="py-sm px-md text-on-surface-variant">
                      {getRelativeTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card stack view */}
          <div className="block md:hidden flex flex-col gap-md">
            {filtered.map((order) => (
              <div
                key={order._id}
                onClick={() => handleOpenDrawer(order)}
                className="bg-surface border-[0.5px] border-outline-variant rounded-xl p-md flex flex-col gap-sm hover:bg-surface-container-lowest transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-price-md text-[12px] text-on-surface-variant font-medium uppercase select-all">
                    {order.razorpayOrderId || `ORD-${order._id.substring(0, 4)}`}
                  </span>
                  <span className="font-label-xs text-label-xs text-on-surface-variant">
                    {getRelativeTime(order.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between items-start mt-xs">
                  <div className="min-w-0">
                    <h4 className="font-body-md text-body-md font-medium text-on-surface truncate">
                      {order.productId?.title || "Deleted Product"}
                    </h4>
                    <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">
                      Buyer: {order.buyerId?.name || "Customer"} • Seller: {order.sellerId?.storeName || order.sellerId?.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-price-md text-[14px] text-on-surface font-semibold select-all">
                      ₹{order.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-sm border-t-[0.5px] border-outline-variant/60 pt-sm">
                  {getStatusBadge(order.status)}
                  <span className="font-body-sm text-[12px] text-primary flex items-center gap-1 font-medium">
                    Details <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Drawer Overlay */}
      {selectedOrder && (
        <div
          onClick={handleCloseDrawer}
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
        />
      )}

      {/* Slide-in Detail Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-surface border-l-[0.5px] border-outline-variant overflow-y-auto shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          selectedOrder ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedOrder && (
          <>
            {/* Drawer Header */}
            <div className="px-md py-md flex items-center justify-between border-b-[0.5px] border-outline-variant shrink-0">
              <h3 className="font-body-lg text-body-lg font-medium text-on-surface">Order details</h3>
              <button
                onClick={handleCloseDrawer}
                className="p-xs -mr-xs text-on-surface-variant hover:text-on-surface transition-colors active:scale-95 duration-200"
              >
                <span className="material-symbols-outlined text-[20px] select-none">close</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 divide-y-[0.5px] divide-outline-variant/60">
              {/* Section 1: Order ID + Status + Date */}
              <div className="p-md flex flex-col gap-sm">
                <div className="flex justify-between items-center">
                  <span className="font-price-md text-[13px] text-on-surface-variant font-medium uppercase select-all">
                    {selectedOrder.razorpayOrderId || `ORD-${selectedOrder._id.substring(0, 4)}`}
                  </span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="flex justify-between text-label-xs text-on-surface-variant">
                  <span>Order Placed</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Section 2: Product */}
              <div className="p-md flex gap-sm items-center">
                {selectedOrder.productId?.imageUrl ? (
                  <img
                    alt={selectedOrder.productId.title}
                    className="w-16 h-16 rounded object-cover border-[0.5px] border-outline-variant shrink-0"
                    src={selectedOrder.productId.imageUrl}
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-surface-container-high border-[0.5px] border-outline-variant shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline">image</span>
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-body-sm text-body-sm font-semibold text-on-surface line-clamp-2 leading-snug">
                    {selectedOrder.productId?.title || "Deleted Product"}
                  </h4>
                  <p className="font-price-md text-price-md text-primary font-bold mt-1">
                    ₹{selectedOrder.productId?.price ? selectedOrder.productId.price.toLocaleString() : selectedOrder.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Section 3: Buyer */}
              <div className="p-md flex flex-col gap-xs">
                <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
                  Buyer Information
                </p>
                <h4 className="font-body-sm text-body-sm font-medium text-on-surface mt-0.5">
                  {selectedOrder.buyerId?.name || "Customer"}
                </h4>
                <p className="font-body-sm text-[12px] text-on-surface-variant select-all">
                  {selectedOrder.buyerId?.email}
                </p>
                <p className="font-body-sm text-[12px] text-on-surface-variant select-all mt-0.5">
                  Phone: {selectedOrder.buyerId?.phone || "Address on file"}
                </p>
              </div>

              {/* Section 4: Seller */}
              <div className="p-md flex flex-col gap-xs">
                <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
                  Seller Store
                </p>
                <h4 className="font-body-sm text-body-sm font-medium text-on-surface mt-0.5">
                  {selectedOrder.sellerId?.storeName || selectedOrder.sellerId?.name || "Artisan"}
                </h4>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  Location: {selectedOrder.sellerId?.location || "India"}
                </p>
              </div>

              {/* Section 5: Payment Details */}
              <div className="p-md flex flex-col gap-xs">
                <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
                  Payment Details
                </p>
                <p className="font-price-md text-[13px] text-on-surface-variant select-all mt-1 uppercase">
                  Payment ID: {selectedOrder.razorpayPaymentId || "pay_•••••••••••"}
                </p>
              </div>

              {/* Section 6: Status Update Dropdown */}
              <div className="p-md flex flex-col gap-xs">
                <label className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider mb-xs">
                  Update status
                </label>
                <select
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                  className="w-full border-[0.5px] border-outline-variant rounded-lg px-sm py-sm body-sm focus:outline-none focus:border-primary bg-surface text-on-surface font-medium"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>

            {/* Drawer Footer Action */}
            <div className="p-md border-t-[0.5px] border-outline-variant bg-surface shrink-0">
              <button
                disabled={saving || tempStatus === selectedOrder.status}
                onClick={handleSaveChanges}
                className="w-full bg-primary text-on-primary h-xxl rounded-lg font-body-sm text-body-sm font-medium hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving Changes..." : "Save changes"}
              </button>
            </div>
          </>
        )}
      </aside>
    </section>
  );
}
