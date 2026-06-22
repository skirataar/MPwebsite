import { NextRequest, NextResponse } from "next/server";
import { connectDB, Product } from "@v-market/db";
import { seedDB } from "@/utils/seed";

// GET /api/admin/products
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await seedDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = {};
    if (status) {
      if (status === "LIVE") {
        query.status = "LIVE";
      } else if (status === "REVIEW") {
        query.status = "REVIEW";
      } else if (status === "REJECTED") {
        query.status = "REJECTED";
      }
    }

    const products = await Product.find(query)
      .populate("sellerId", "name storeName username avatarUrl")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products
    });
  } catch (error: any) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { productId, status } = body;

    if (!productId || !status) {
      return NextResponse.json({ error: "Missing productId or status" }, { status: 400 });
    }

    if (!["LIVE", "REVIEW", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: { status } },
      { new: true }
    ).populate("sellerId", "name storeName username avatarUrl");

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct
    });
  } catch (error: any) {
    console.error("Admin product update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
