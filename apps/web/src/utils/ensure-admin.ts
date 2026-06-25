import { connectDB, User } from "@v-market/db";
import bcrypt from "bcryptjs";

export async function ensureAdminUser() {
  await connectDB();

  // Check if admin already exists
  const adminExists = await User.findOne({ email: "admin@vmarket.in" });
  if (adminExists) {
    return;
  }

  console.log("Provisioning default administrator account...");
  const hashedPassword = await bcrypt.hash("Admin@vmarket123", 12);
  
  await User.create({
    name: "Admin User",
    username: "admin",
    email: "admin@vmarket.in",
    password: hashedPassword,
    role: "ADMIN",
    phone: "+91 90000 00000",
    onboardingComplete: true,
    status: "ACTIVE"
  });

  console.log("Administrator account provisioned successfully.");
}
