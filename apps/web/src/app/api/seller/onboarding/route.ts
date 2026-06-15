import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB, User } from "@v-market/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if ((session.user as any).role !== "SELLER" && (session.user as any).role !== "seller") {
      return NextResponse.json({ error: "Only sellers can complete this onboarding" }, { status: 403 });
    }

    const body = await req.json();
    const { storeName, phone, bio } = body;

    if (!storeName || !phone) {
      return NextResponse.json({ error: "Store Name and Phone Number are required" }, { status: 400 });
    }

    await connectDB();

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

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Seller onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
