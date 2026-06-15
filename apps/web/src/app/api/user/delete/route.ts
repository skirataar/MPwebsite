import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB, User } from "@v-market/db";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const deleted = await User.findOneAndDelete({ email: (session.user as any).email });

    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete-account]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
