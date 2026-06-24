import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB, User } from "@v-market/db";

export async function POST(req: NextRequest) {
  try {
    console.log("[onboarding api] POST request received.");
    const session = await getServerSession(authOptions);
    console.log("[onboarding api] Session retrieved:", JSON.stringify(session || null));
    
    if (!session?.user) {
      console.warn("[onboarding api] Authentication failed: no session user");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    console.log("[onboarding api] User role:", userRole);
    if (userRole !== "SELLER" && userRole !== "seller") {
      console.warn("[onboarding api] Authorization failed: role is", userRole);
      return NextResponse.json({ error: "Only sellers can complete this onboarding" }, { status: 403 });
    }

    const body = await req.json();
    const { storeName, phone, bio } = body;
    console.log("[onboarding api] Payload - storeName:", storeName, "phone:", phone, "bio length:", bio?.length || 0);

    if (!storeName || !phone) {
      console.warn("[onboarding api] Missing fields storeName or phone");
      return NextResponse.json({ error: "Store Name and Phone Number are required" }, { status: 400 });
    }

    console.log("[onboarding api] Connecting to DB...");
    await connectDB();
    console.log("[onboarding api] DB Connected. Updating user email:", session.user.email);

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          storeName, 
          phone, 
          bio, 
          onboardingComplete: true 
        } 
      },
      { new: true }
    );

    console.log("[onboarding api] Update completed. User found:", !!updatedUser);
    if (!updatedUser) {
      console.warn("[onboarding api] User not found in database for email:", session.user.email);
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    console.log("[onboarding api] Onboarding success. Returning response.");
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Seller onboarding error:", error);
    
    // Handle MongoDB duplicate key constraint failures (e.g. unique index on phone_1)
    if (error.code === 11000) {
      const fieldName = Object.keys(error.keyPattern || {})[0] || "field";
      const formattedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      return NextResponse.json(
        { error: `${formattedField} is already registered to another account. Please use a different one.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
