import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectDB, User, WishlistItem, Product } from '@v-market/db';
import { NextRequest, NextResponse } from 'next/server';

type Context = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ email: (session.user as any).email }).select('_id');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const productId = params.id;
    const existing = await WishlistItem.findOne({ userId: user._id, productId });

    let wishlisted: boolean;

    if (existing) {
      await WishlistItem.deleteOne({ _id: existing._id });
      wishlisted = false;
    } else {
      await WishlistItem.create({ userId: user._id, productId });
      wishlisted = true;
    }

    return NextResponse.json({ wishlisted });
  } catch (err) {
    console.error('[POST /api/products/[id]/wishlist]', err);
    return NextResponse.json({ error: 'Failed to toggle wishlist' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  try {
    await connectDB();

    if (!session || !session.user || !(session.user as any).email) {
      return NextResponse.json({ wishlisted: false });
    }

    const user = await User.findOne({ email: (session.user as any).email }).select('_id');
    if (!user) return NextResponse.json({ wishlisted: false });

    const existing = await WishlistItem.findOne({ userId: user._id, productId: params.id });
    return NextResponse.json({ wishlisted: !!existing });
  } catch (err) {
    console.error('[GET /api/products/[id]/wishlist]', err);
    return NextResponse.json({ error: 'Failed to fetch wishlist status' }, { status: 500 });
  }
}
