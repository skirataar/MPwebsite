import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB, User, Like } from "@v-market/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: (session.user as any).email }).select('_id');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find all likes by this user
    const likes = await Like.find({ userId: user._id }).select('productId');
    const productIds = likes.map(like => like.productId.toString());

    return NextResponse.json({ likes: productIds });
  } catch (err) {
    console.error("[GET /api/user/likes]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
