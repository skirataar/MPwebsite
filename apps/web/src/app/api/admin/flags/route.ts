import { NextRequest, NextResponse } from "next/server";
import { connectDB, FeatureFlag } from "@v-market/db";
import { seedDB } from "@/utils/seed";

// GET /api/admin/flags
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await seedDB();

    const flags = await FeatureFlag.find({}).sort({ key: 1 });

    return NextResponse.json({
      success: true,
      flags
    });
  } catch (error: any) {
    console.error("Admin flags fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch flags" },
      { status: 500 }
    );
  }
}

// POST /api/admin/flags
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const updatedFlag = await FeatureFlag.findOneAndUpdate(
      { key },
      { $set: { value: !!value } },
      { new: true }
    );

    if (!updatedFlag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      flag: updatedFlag
    });
  } catch (error: any) {
    console.error("Admin flag update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update flag" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
