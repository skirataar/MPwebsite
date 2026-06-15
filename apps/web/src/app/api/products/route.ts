import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB, Product, User } from '@v-market/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);
  const category = searchParams.get('category');
  const sortBy = searchParams.get('sortBy') || 'newest';

  try {
    await connectDB();

    const filter: Record<string, unknown> = { status: 'LIVE' };
    if (category) filter.category = category;
    if (cursor) filter._id = { $lt: cursor };

    let sortObj: Record<string, any> = { _id: -1 };
    if (sortBy === 'price-asc') {
      sortObj = { price: 1, _id: -1 };
    } else if (sortBy === 'price-desc') {
      sortObj = { price: -1, _id: -1 };
    } else if (sortBy === 'popular') {
      sortObj = { likesCount: -1, _id: -1 };
    }

    const products = await Product.find(filter)
      .sort(sortObj)
      .limit(limit + 1)
      .populate('sellerId', 'name username avatarUrl')
      .lean();

    const hasNextPage = products.length > limit;
    const data = hasNextPage ? products.slice(0, limit) : products;
    const nextCursor = hasNextPage ? String(data[data.length - 1]._id) : null;

    return NextResponse.json({ products: data, nextCursor });
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const seller = await User.findOne({ email: (session.user as any).email }).select('_id role');
    if (!seller || seller.role !== 'SELLER') {
      return NextResponse.json({ error: 'Seller account required' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, mrp, stock, category, imageUrl, videoUrl, thumbnailUrl } = body;

    if (!title || !description || !price || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields: title, description, price, imageUrl' }, { status: 400 });
    }

    const product = await Product.create({
      title,
      description,
      price: parseFloat(price),
      mrp: mrp ? parseFloat(mrp) : undefined,
      stock: stock ? parseInt(stock, 10) : 1,
      category: category ?? 'handmade',
      imageUrl,
      videoUrl: videoUrl ?? undefined,
      thumbnailUrl: thumbnailUrl ?? undefined,
      status: 'REVIEW',
      sellerId: seller._id,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
