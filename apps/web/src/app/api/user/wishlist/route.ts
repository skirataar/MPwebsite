import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB, User, WishlistItem } from "@v-market/db";

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

    // Find all wishlist items by this user
    const wishlistItems = await WishlistItem.find({ userId: user._id }).select('productId');
    const productIds = wishlistItems.map(item => item.productId.toString());

    return NextResponse.json({ wishlist: productIds });
  } catch (err) {
    console.error("[GET /api/user/wishlist]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
