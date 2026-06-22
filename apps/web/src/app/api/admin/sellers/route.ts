import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@v-market/db";
import { seedDB } from "@/utils/seed";

// GET /api/admin/sellers
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await seedDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = { role: "SELLER" };
    if (status) {
      query.status = status;
    }

    const sellers = await User.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      sellers
    });
  } catch (error: any) {
    console.error("Admin sellers fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sellers" },
      { status: 500 }
    );
  }
}

// POST /api/admin/sellers
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { sellerId, status } = body;

    if (!sellerId || !status) {
      return NextResponse.json({ error: "Missing sellerId or status" }, { status: 400 });
    }

    if (!["ACTIVE", "REJECTED", "PENDING", "SUSPENDED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedSeller = await User.findOneAndUpdate(
      { _id: sellerId, role: "SELLER" },
      { $set: { status } },
      { new: true }
    );

    if (!updatedSeller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      seller: updatedSeller
    });
  } catch (error: any) {
    console.error("Admin seller update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update seller" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
