import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB, CartItem, User } from "@v-market/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Find the user first
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find all cart items for this user and populate the product + nested seller
    const dbCartItems = await CartItem.find({ userId: user._id }).populate({
      path: "productId",
      populate: {
        path: "sellerId",
        model: "User"
      }
    });

    // Map to the front-end CartItem interface
    const cart = dbCartItems
      .filter((item) => item.productId) // Filter out deleted/null products
      .map((item) => {
        const product = item.productId as any;
        const seller = product.sellerId as any;
        return {
          id: product._id.toString(),
          title: product.title,
          shop: seller?.storeName || seller?.name || "Artisan Shop",
          price: product.price,
          quantity: item.quantity,
          image: product.imageUrl || product.thumbnailUrl || "",
          dataAlt: product.description || "",
        };
      });

    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error("[api/cart GET]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cart } = await req.json();
    if (!Array.isArray(cart)) {
      return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
    }

    await connectDB();
    
    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clear existing cart items for this user
    await CartItem.deleteMany({ userId: user._id });

    // Save the new cart items
    if (cart.length > 0) {
      const cartToSave = cart.map((item: any) => ({
        userId: user._id,
        productId: item.id, // item.id contains the product ID on the client
        quantity: item.quantity,
      }));
      await CartItem.insertMany(cartToSave);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[api/cart POST]", error);
    return NextResponse.json({ error: error.message || "Failed to update cart" }, { status: 500 });
  }
}
