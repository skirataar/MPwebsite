import { connectDB, User, Product, Order, FeatureFlag } from "@v-market/db";
import mongoose from "mongoose";

export async function seedDB() {
  await connectDB();

  // 1. Check if we already have seeded data
  const userCount = await User.countDocuments();
  if (userCount > 2) {
    // Already seeded or has data, just ensure admin exists and has password, then skip
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("Admin@vmarket123", 12);
    await User.findOneAndUpdate(
      { email: "admin@vmarket.in" },
      {
        $setOnInsert: {
          name: "Admin User",
          username: "admin",
          role: "ADMIN",
          phone: "+91 90000 00000",
          onboardingComplete: true,
          status: "ACTIVE"
        },
        $set: {
          password: hashedPassword
        }
      },
      { upsert: true, new: true }
    );
    return;
  }

  console.log("Seeding initial V-Market database...");

  // 2. Clear existing collections to start fresh with a consistent set
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await FeatureFlag.deleteMany({});

  // 3. Create Sellers
  const sellers = [
    {
      name: "Nalli Silks",
      username: "nallisilks",
      email: "nalli@vmarket.in",
      role: "SELLER",
      phone: "+91 99123 45678",
      storeName: "Nalli Silk Crafts",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      onboardingComplete: true,
      status: "ACTIVE",
      location: "Chennai, TN",
      category: "Fashion",
      gstin: "33AAAAA1111A1Z1",
    },
    {
      name: "Studio Maati",
      username: "studiomaati",
      email: "maati@vmarket.in",
      role: "SELLER",
      phone: "+91 99234 56789",
      storeName: "Studio Maati",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      onboardingComplete: true,
      status: "ACTIVE",
      location: "Khurja, UP",
      category: "Home Decor",
      gstin: "09BBBBB2222B2Y2",
    },
    {
      name: "Vastra Studio",
      username: "vastra",
      email: "vastra@vmarket.in",
      role: "SELLER",
      phone: "+91 99345 67890",
      storeName: "Vastra Studio",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      onboardingComplete: true,
      status: "ACTIVE",
      location: "Kolkata, WB",
      category: "Fashion",
      gstin: "19CCCCC3333C3X3",
    },
    {
      name: "Silver Lining",
      username: "silverlining",
      email: "silver@vmarket.in",
      role: "SELLER",
      phone: "+91 99456 78901",
      storeName: "Silver Lining Jewellery",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      onboardingComplete: true,
      status: "ACTIVE",
      location: "Jaipur, RJ",
      category: "Jewellery",
      gstin: "08DDDDD4444D4W4",
    },
    {
      name: "Kashmir Artistry Hub",
      username: "kashmirart",
      email: "kashmir@vmarket.in",
      role: "SELLER",
      phone: "+91 98987 65345",
      storeName: "Kashmir Artistry Hub",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      onboardingComplete: true,
      status: "PENDING", // Pending approval
      location: "Srinagar, J&K",
      category: "Handicrafts & Textiles",
      gstin: "27AAAAA0000A1Z5",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hrs ago
    },
    {
      name: "PureAura Organics",
      username: "pureaura",
      email: "pureaura@vmarket.in",
      role: "SELLER",
      phone: "+91 99888 77123",
      storeName: "PureAura Organics",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      onboardingComplete: true,
      status: "PENDING", // Pending approval
      location: "Lucknow, UP",
      category: "Beauty & Wellness",
      gstin: "09BBBBB1111B2Y6",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hrs ago
    },
    {
      name: "Southern Vintage",
      username: "southernvintage",
      email: "vintage@vmarket.in",
      role: "SELLER",
      phone: "+91 97777 66890",
      storeName: "Southern Vintage",
      avatarUrl: "",
      onboardingComplete: true,
      status: "PENDING", // Incomplete documentation
      location: "Chennai, TN",
      category: "Antiques & Decor",
      gstin: "33CCCCC2222C3X7",
      documentIssue: "Incomplete documentation",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      name: "Studio Earth",
      username: "studioearth",
      email: "earth@vmarket.in",
      role: "SELLER",
      phone: "+91 97012 34567",
      storeName: "Studio Earth",
      avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop",
      onboardingComplete: true,
      status: "ACTIVE",
      location: "Pune, MH",
      category: "Home Decor",
      gstin: "27EEEEE5555E5V5",
    }
  ];

  const dbSellers = await User.insertMany(sellers);
  const sellerMap = new Map(dbSellers.map(s => [s.username, s._id]));

  // 4. Create Buyers
  const buyers = [
    {
      name: "Priya Mehta",
      username: "priyamehta",
      email: "priya@gmail.com",
      role: "BUYER",
      phone: "+91 98765 43210",
      avatarUrl: "",
      onboardingComplete: true,
      status: "ACTIVE",
    },
    {
      name: "Rahul Nair",
      username: "rahulnair",
      email: "rahul@gmail.com",
      role: "BUYER",
      phone: "+91 87654 32109",
      avatarUrl: "",
      onboardingComplete: true,
      status: "ACTIVE",
    },
    {
      name: "Ananya Singh",
      username: "ananya",
      email: "ananya@gmail.com",
      role: "BUYER",
      phone: "+91 76543 21098",
      avatarUrl: "",
      onboardingComplete: true,
      status: "ACTIVE",
    },
    {
      name: "Vikram Patel",
      username: "vikram",
      email: "vikram@gmail.com",
      role: "BUYER",
      phone: "+91 65432 10987",
      avatarUrl: "",
      onboardingComplete: true,
      status: "SUSPENDED", // Suspended
    },
    {
      name: "Meera Joshi",
      username: "meera",
      email: "meera@gmail.com",
      role: "BUYER",
      phone: "+91 98989 89898",
      avatarUrl: "",
      onboardingComplete: true,
      status: "ACTIVE",
    },
    {
      name: "Arjun N.",
      username: "arjun",
      email: "arjun@gmail.com",
      role: "BUYER",
      phone: "+91 97979 79797",
      avatarUrl: "",
      onboardingComplete: true,
      status: "ACTIVE",
    },
    {
      name: "Sonia T.",
      username: "sonia",
      email: "sonia@gmail.com",
      role: "BUYER",
      phone: "+91 96969 69696",
      avatarUrl: "",
      onboardingComplete: true,
      status: "ACTIVE",
    }
  ];

  const dbBuyers = await User.insertMany(buyers);
  const buyerMap = new Map(dbBuyers.map(b => [b.username, b._id]));

  // Also make sure we have at least one ADMIN
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("Admin@vmarket123", 12);
  await User.findOneAndUpdate(
    { email: "admin@vmarket.in" },
    {
      $setOnInsert: {
        name: "Admin User",
        username: "admin",
        role: "ADMIN",
        phone: "+91 90000 00000",
        onboardingComplete: true,
        status: "ACTIVE"
      },
      $set: {
        password: hashedPassword
      }
    },
    { upsert: true, new: true }
  );

  // 5. Create Products
  const products = [
    {
      title: "Kanjeevaram Silk Saree",
      description: "A gorgeous, hand-woven pure Kanjeevaram silk saree with rich zari border and traditional patterns.",
      price: 14500,
      mrp: 18000,
      stock: 4,
      category: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
      status: "LIVE",
      sellerId: sellerMap.get("nallisilks"),
    },
    {
      title: "Handcrafted Ceramic Vase",
      description: "A beautifully painted earthy ceramic vase, perfect for home decor and dried flowers.",
      price: 1299,
      mrp: 1999,
      stock: 12,
      category: "Home Decor",
      imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600",
      status: "LIVE",
      sellerId: sellerMap.get("studiomaati"),
    },
    {
      title: "Kashmiri Pashmina Shawl",
      description: "An authentic, hand-spun and hand-embroidered pure Cashmere Pashmina shawl from Srinagar.",
      price: 8200,
      mrp: 12000,
      stock: 2,
      category: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600",
      status: "REVIEW", // Pending product
      sellerId: sellerMap.get("kashmirart"),
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      title: "Organic Rosehip Face Oil",
      description: "100% pure cold-pressed organic rosehip seed oil for natural skin glow and wellness.",
      price: 699,
      mrp: 999,
      stock: 30,
      category: "Beauty",
      imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600",
      status: "REVIEW", // Pending product
      sellerId: sellerMap.get("pureaura"),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      title: "Handloom Cotton Saree",
      description: "Lightweight, breathable pure handloom cotton saree in pastel colors, perfect for daily wear.",
      price: 3400,
      mrp: 4500,
      stock: 0, // Out of stock
      category: "Fashion",
      imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
      status: "LIVE",
      sellerId: sellerMap.get("vastra"),
    },
    {
      title: "Minimalist Sterling Silver Ring",
      description: "925 sterling silver ring with a sleek, minimalist pattern, perfect for stacking.",
      price: 1450,
      mrp: 2499,
      stock: 25,
      category: "Jewellery",
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
      status: "REJECTED", // Flagged in UI
      sellerId: sellerMap.get("silverlining"),
    }
  ];

  const dbProducts = await Product.insertMany(products);
  const productMap = new Map(dbProducts.map(p => [p.title, p._id]));

  // 6. Create Orders
  const orders = [
    {
      buyerId: buyerMap.get("priyamehta"),
      productId: productMap.get("Kanjeevaram Silk Saree"),
      sellerId: sellerMap.get("nallisilks"),
      amount: 14500,
      quantity: 1,
      status: "DELIVERED",
      razorpayOrderId: "ORD-1042",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hrs ago
    },
    {
      buyerId: buyerMap.get("rahulnair"),
      productId: productMap.get("Handloom Cotton Saree"),
      sellerId: sellerMap.get("vastra"),
      amount: 3400,
      quantity: 1,
      status: "SHIPPED",
      razorpayOrderId: "ORD-1041",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hrs ago
    },
    {
      buyerId: buyerMap.get("ananya"),
      productId: productMap.get("Handcrafted Ceramic Vase"),
      sellerId: sellerMap.get("studiomaati"),
      amount: 1299,
      quantity: 1,
      status: "PENDING",
      razorpayOrderId: "ORD-1040",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hrs ago
    },
    {
      buyerId: buyerMap.get("priyamehta"),
      productId: productMap.get("Organic Rosehip Face Oil"),
      sellerId: sellerMap.get("pureaura"),
      amount: 699,
      quantity: 1,
      status: "CONFIRMED",
      razorpayOrderId: "ORD-1039",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      buyerId: buyerMap.get("vikram"),
      productId: productMap.get("Minimalist Sterling Silver Ring"),
      sellerId: sellerMap.get("silverlining"),
      amount: 1450,
      quantity: 1,
      status: "CANCELLED",
      razorpayOrderId: "ORD-1038",
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // Yesterday
    },
    {
      buyerId: buyerMap.get("meera"),
      productId: productMap.get("Kashmiri Pashmina Shawl"),
      sellerId: sellerMap.get("kashmirart"),
      amount: 8200,
      quantity: 1,
      status: "REFUNDED",
      razorpayOrderId: "ORD-1037",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      buyerId: buyerMap.get("arjun"),
      productId: productMap.get("Kanjeevaram Silk Saree"),
      sellerId: sellerMap.get("nallisilks"),
      amount: 14500,
      quantity: 1,
      status: "DELIVERED",
      razorpayOrderId: "ORD-1036",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      buyerId: buyerMap.get("sonia"),
      productId: productMap.get("Handcrafted Ceramic Vase"),
      sellerId: sellerMap.get("studiomaati"),
      amount: 650, // Ceramic Bowl from design, let's keep it simple with ceramic vase / bowl
      quantity: 1,
      status: "DELIVERED",
      razorpayOrderId: "ORD-1035",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
  ];

  await Order.insertMany(orders);

  // 7. Create Feature Flags
  const flags = [
    { key: "video_upload_enabled", description: "Allow sellers to upload product videos", value: true },
    { key: "buy_now_enabled", description: "Show Buy Now button on product feed", value: true },
    { key: "comments_enabled", description: "Enable comments on product videos", value: false },
    { key: "whatsapp_share_enabled", description: "WhatsApp share button on feed", value: true },
    { key: "cod_enabled", description: "Cash on delivery payment option", value: false },
    { key: "seller_analytics_enabled", description: "Show analytics tab in seller dashboard", value: true },
  ];

  await FeatureFlag.insertMany(flags);

  console.log("Database seeded successfully with 8 sellers, 7 buyers, 6 products, 8 orders and 6 feature flags.");
}
