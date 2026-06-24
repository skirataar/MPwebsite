import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise, connectDB, User } from "@v-market/db";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string || "dummy-client-id",
      clientSecret: process.env.GOOGLE_SECRET as string || "dummy-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();

        // Ensure database has default admin credentials on first auth attempt
        try {
          const { ensureAdminUser } = require("@/utils/ensure-admin");
          await ensureAdminUser();
        } catch (e) {
          console.error("Auto-provisioning admin from credentials authorize failed:", e);
        }
        
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.firstName,
          role: user.role,
        } as any;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Handle client-side session updates
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.onboardingComplete !== undefined) token.onboardingComplete = session.onboardingComplete;
      }

      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "BUYER";
        token.onboardingComplete = (user as any).onboardingComplete || false;
      }

      // Always re-fetch role from DB on first sign-in (any provider)
      // This ensures credentials + Google users both get the correct role
      if (account) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role || "BUYER";
          token.onboardingComplete = dbUser.onboardingComplete || false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).onboardingComplete = token.onboardingComplete;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
