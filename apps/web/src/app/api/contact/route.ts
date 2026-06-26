import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    console.log("[Contact Us submission]", { name, email, subject, message });

    // Generate reference ID like VM-CONTACT-XXXXXX
    const refId = `VM-CONTACT-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      refId,
      message: "Message received successfully",
    });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json({ error: "Failed to process inquiry" }, { status: 500 });
  }
}
