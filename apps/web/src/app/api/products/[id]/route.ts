import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB, Product, User } from '@v-market/db';
import { NextRequest, NextResponse } from 'next/server';

type Context = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    await connectDB();

    const product = await Product.findById(params.id)
      .populate('sellerId', 'name username avatarUrl bio')
      .lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error('[GET /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const seller = await User.findOne({ email: (session.user as any).email }).select('_id role');
    if (!seller || seller.role !== 'SELLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const product = await Product.findOne({ _id: params.id, sellerId: seller._id });
    if (!product) {
      return NextResponse.json({ error: 'Not found or not your listing' }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, price, mrp, stock, category, imageUrl, videoUrl, thumbnailUrl } = body;

    const updated = await Product.findByIdAndUpdate(
      params.id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(mrp !== undefined && { mrp: mrp ? parseFloat(mrp) : null }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(category !== undefined && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        status: 'REVIEW', 
      },
      { new: true }
    );

    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error('[PATCH /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const seller = await User.findOne({ email: (session.user as any).email }).select('_id role');
    if (!seller || seller.role !== 'SELLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const product = await Product.findOneAndDelete({ _id: params.id, sellerId: seller._id });
    if (!product) {
      return NextResponse.json({ error: 'Not found or not your listing' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
