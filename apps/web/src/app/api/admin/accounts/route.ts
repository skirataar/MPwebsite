import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@v-market/db";
import { seedDB } from "@/utils/seed";

// GET /api/admin/accounts
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await seedDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { storeName: { $regex: search, $options: "i" } }
      ];
    }

    const accounts = await User.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      accounts
    });
  } catch (error: any) {
    console.error("Admin accounts fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST /api/admin/accounts
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { accountId, status } = body;

    if (!accountId || !status) {
      return NextResponse.json({ error: "Missing accountId or status" }, { status: 400 });
    }

    if (!["ACTIVE", "PENDING", "SUSPENDED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedAccount = await User.findByIdAndUpdate(
      accountId,
      { $set: { status } },
      { new: true }
    );

    if (!updatedAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      account: updatedAccount
    });
  } catch (error: any) {
    console.error("Admin account update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update account" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
