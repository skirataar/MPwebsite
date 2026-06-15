import { NextResponse } from "next/server";
import { connectDB, User } from "@v-market/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./../[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    await connectDB();
    const user = await User.findOne({ email: (session.user as any).email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (role === "SELLER" && user.role !== "SELLER") {
      user.role = "SELLER";
      await user.save();
    } else if (role === "BUYER" && user.role !== "BUYER") {
      user.role = "BUYER";
      await user.save();
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
