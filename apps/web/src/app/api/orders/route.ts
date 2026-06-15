import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB, Product, User, Order } from '@v-market/db';
import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from "../../../data/products";

/**
 * Helper to resolve a product from either a database ObjectId or a static numeric ID.
 * If it's a static ID, it creates the product in MongoDB on-the-fly so it can be ordered.
 */
async function resolveDbProduct(idOrString: string) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrString);
  if (isObjectId) {
    return await Product.findById(idOrString);
  }

  // Find in static products
  const staticProduct = PRODUCTS.find(p => String(p.id) === idOrString);
  if (!staticProduct) return null;

  // Check if it already exists in MongoDB
  let dbProduct = await Product.findOne({ title: staticProduct.title });
  if (dbProduct) return dbProduct;

  // Ensure there's a seller in MongoDB for this static product
  const sellerEmail = `${staticProduct.username.replace('@', '').toLowerCase()}@vmarket.com`;
  let seller = await User.findOne({ email: sellerEmail });
  if (!seller) {
    seller = await User.create({
      name: staticProduct.seller,
      email: sellerEmail,
      username: staticProduct.username.replace('@', '').toLowerCase(),
      role: 'SELLER',
      avatarUrl: staticProduct.avatar,
    });
  }

  // Create the product in MongoDB
  dbProduct = await Product.create({
    title: staticProduct.title,
    description: staticProduct.description,
    price: staticProduct.price,
    mrp: staticProduct.originalPrice,
    stock: staticProduct.stockLeft || 10,
    category: staticProduct.category,
    imageUrl: staticProduct.videoBg || staticProduct.productThumb,
    videoUrl: staticProduct.videoUrl,
    status: 'LIVE',
    sellerId: seller._id,
  });

  return dbProduct;
}

/**
 * GET /api/orders
 * Returns all orders placed by the currently logged-in buyer.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const buyer = await User.findOne({ email: (session.user as any).email }).select('_id');
    if (!buyer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orders = await Order.find({ buyerId: buyer._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'productId',
        populate: {
          path: 'sellerId',
          select: 'name username avatarUrl'
        }
      })
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Places a direct purchase order or cart-checkout orders.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const buyer = await User.findOne({ email: (session.user as any).email }).select('_id');
    if (!buyer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { productId, quantity, items } = body;

    const ordersCreated = [];

    if (items && Array.isArray(items)) {
      // Cart checkout processing
      for (const item of items) {
        const product = await resolveDbProduct(String(item.id || item.productId));
        if (!product) continue;

        const qty = item.quantity || 1;
        const amount = product.price * qty;

        const dummyRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 11)}`;
        const dummyRazorpayPaymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;

        const newOrder = await Order.create({
          buyerId: buyer._id,
          productId: product._id,
          sellerId: product.sellerId,
          amount,
          quantity: qty,
          status: 'PAID', // Automatically mark as paid for demonstration
          razorpayOrderId: dummyRazorpayOrderId,
          razorpayPaymentId: dummyRazorpayPaymentId,
        });

        // Decrement stock
        if (product.stock >= qty) {
          product.stock -= qty;
          await product.save();
        }

        ordersCreated.push(newOrder);
      }
    } else {
      // Direct single product buy
      if (!productId) {
        return NextResponse.json({ error: 'Missing required field: productId or items' }, { status: 400 });
      }

      const product = await resolveDbProduct(String(productId));
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const qty = quantity ? parseInt(quantity, 10) : 1;
      const amount = product.price * qty;

      const dummyRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 11)}`;
      const dummyRazorpayPaymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;

      const newOrder = await Order.create({
        buyerId: buyer._id,
        productId: product._id,
        sellerId: product.sellerId,
        amount,
        quantity: qty,
        status: 'PAID',
        razorpayOrderId: dummyRazorpayOrderId,
        razorpayPaymentId: dummyRazorpayPaymentId,
      });

      // Decrement stock
      if (product.stock >= qty) {
        product.stock -= qty;
        await product.save();
      }

      ordersCreated.push(newOrder);
    }

    return NextResponse.json({ success: true, orders: ordersCreated }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/orders]', err);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
