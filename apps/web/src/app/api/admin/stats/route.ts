import { NextRequest, NextResponse } from "next/server";
import { connectDB, User, Product, Order } from "@v-market/db";
import { seedDB } from "@/utils/seed";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await seedDB();

    // Calculate total users
    const totalUsers = await User.countDocuments({});

    // Active sellers
    const activeSellers = await User.countDocuments({ role: "SELLER", status: "ACTIVE" });
    const pendingSellers = await User.countDocuments({ role: "SELLER", status: "PENDING" });

    // Orders today and GMV today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const ordersTodayDocs = await Order.find({
      createdAt: { $gte: startOfToday }
    });

    const ordersTodayCount = ordersTodayDocs.length;
    const gmvToday = ordersTodayDocs.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Flagged items
    const flaggedItemsCount = await Product.countDocuments({ status: "REJECTED" });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeSellers,
        pendingSellers,
        ordersTodayCount,
        gmvToday,
        flaggedItemsCount
      }
    });
  } catch (error: any) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
