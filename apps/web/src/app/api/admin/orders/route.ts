import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@v-market/db";
import { seedDB } from "@/utils/seed";

// GET /api/admin/orders
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await seedDB();

    const orders = await Order.find({})
      .populate("buyerId", "name email phone avatarUrl")
      .populate("productId", "title imageUrl price category stock")
      .populate("sellerId", "name storeName username location")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error: any) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const validStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "PAID", "FAILED", "ESCROW_RELEASED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { new: true }
    )
      .populate("buyerId", "name email phone avatarUrl")
      .populate("productId", "title imageUrl price category stock")
      .populate("sellerId", "name storeName username location");

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });
  } catch (error: any) {
    console.error("Admin order status update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
