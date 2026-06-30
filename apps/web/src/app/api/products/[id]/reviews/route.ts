import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectDB, Review, User, Product } from '@v-market/db';
import { NextRequest, NextResponse } from 'next/server';

type Context = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    await connectDB();

    const reviews = await Review.find({ productId: params.id })
      .populate('userId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error('[GET /api/products/[id]/reviews]', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ email: (session.user as any).email }).select('_id');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }

    // Upsert review (one review per user per product)
    const existingReview = await Review.findOne({ userId: user._id, productId: product._id });
    let review;
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      review = existingReview;
    } else {
      review = await Review.create({
        userId: user._id,
        productId: product._id,
        rating,
        comment,
      });
    }

    return NextResponse.json({ review });
  } catch (err) {
    console.error('[POST /api/products/[id]/reviews]', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
