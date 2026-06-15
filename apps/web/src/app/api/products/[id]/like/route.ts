import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectDB, User, Like, Product } from '@v-market/db';
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
    const existing = await Like.findOne({ userId: user._id, productId });

    let liked: boolean;
    let delta: number;

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      liked = false;
      delta = -1;
    } else {
      await Like.create({ userId: user._id, productId });
      liked = true;
      delta = 1;
    }

    const updated = await Product.findByIdAndUpdate(
      productId,
      { $inc: { likesCount: delta } },
      { new: true }
    ).select('likesCount');

    return NextResponse.json({ liked, totalLikes: updated?.likesCount ?? 0 });
  } catch (err) {
    console.error('[POST /api/products/[id]/like]', err);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  try {
    await connectDB();

    const product = await Product.findById(params.id).select('likesCount');
    const totalLikes = product?.likesCount ?? 0;

    if (!session || !session.user || !(session.user as any).email) {
      return NextResponse.json({ liked: false, totalLikes });
    }

    const user = await User.findOne({ email: (session.user as any).email }).select('_id');
    if (!user) return NextResponse.json({ liked: false, totalLikes });

    const existing = await Like.findOne({ userId: user._id, productId: params.id });
    return NextResponse.json({ liked: !!existing, totalLikes });
  } catch (err) {
    console.error('[GET /api/products/[id]/like]', err);
    return NextResponse.json({ error: 'Failed to fetch like status' }, { status: 500 });
  }
}
