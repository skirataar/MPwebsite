import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB, Product, User, Order } from '@v-market/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Helper to resolve a product from a database ObjectId.
 */
async function resolveDbProduct(idOrString: string) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrString);
  if (isObjectId) {
    return await Product.findById(idOrString);
  }
  return null;
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
