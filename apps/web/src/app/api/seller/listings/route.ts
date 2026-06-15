import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB, Product, User, Order } from '@v-market/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/seller/listings
 * Seller only. Returns their own listings + aggregate stats.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const seller = await User.findOne({ email: (session.user as any).email }).select('_id role storeName');
    if (!seller || seller.role !== 'SELLER') {
      return NextResponse.json({ error: 'Seller account required' }, { status: 403 });
    }

    const [listings, recentOrders, revenueAgg] = await Promise.all([
      Product.find({ sellerId: seller._id })
        .sort({ createdAt: -1 })
        .lean(),

      Order.find({ sellerId: seller._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('productId', 'title imageUrl')
        .lean(),

      // Aggregate total revenue from paid orders
      Order.aggregate([
        {
          $match: {
            sellerId: seller._id,
            status: { $in: ['PAID', 'ESCROW_RELEASED'] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const totalOrders = revenueAgg[0]?.count ?? 0;

    const stats = {
      totalViews: listings.reduce((acc, curr) => acc + (curr.viewsCount ?? 0), 0),
      totalLikes: listings.reduce((acc, curr) => acc + (curr.likesCount ?? 0), 0),
      totalOrders,
      totalRevenue,
      liveCount: listings.filter((l) => l.status === 'LIVE').length,
    };

    return NextResponse.json({ listings, stats, recentOrders });
  } catch (err) {
    console.error('[GET /api/seller/listings]', err);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}

/**
 * POST /api/seller/listings
 * Create a new product listing for the authenticated seller.
 */
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
      return NextResponse.json(
        { error: 'Missing required fields: title, description, price, imageUrl' },
        { status: 400 }
      );
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
      status: 'LIVE',   // auto-approve for now; change to 'REVIEW' for moderation
      sellerId: seller._id,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/seller/listings]', err);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

/**
 * DELETE /api/seller/listings?id=<productId>
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await connectDB();

    const seller = await User.findOne({ email: (session.user as any).email }).select('_id role');
    if (!seller || seller.role !== 'SELLER') {
      return NextResponse.json({ error: 'Seller account required' }, { status: 403 });
    }

    const deleted = await Product.findOneAndDelete({ _id: id, sellerId: seller._id });
    if (!deleted) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/seller/listings]', err);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
