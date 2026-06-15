import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isSellerRoute =
      path.startsWith("/seller/") && !path.startsWith("/seller/login");

    // ── Unauthenticated: send to correct login page ───────────────────────
    if (!token) {
      if (isSellerRoute) {
        return NextResponse.redirect(new URL("/seller/login", req.url));
      }
      // buyer-protected routes → handled by authorized callback + pages.signIn
      return;
    }

    // ── Authenticated: seller-specific guards ─────────────────────────────
    if (isSellerRoute) {
      // Non-sellers trying to access seller routes → buyer login
      if (token.role !== "SELLER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // Sellers that haven't completed onboarding
      if (!token.onboardingComplete && !path.startsWith("/seller/onboarding")) {
        return NextResponse.redirect(new URL("/seller/onboarding", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req?.nextUrl?.pathname || "";

        // Seller routes: always let through (the middleware function above handles auth)
        if (path.startsWith("/seller/") && !path.startsWith("/seller/login")) {
          return true;
        }

        // Buyer-protected routes require any valid token
        if (
          path.startsWith("/profile") ||
          path.startsWith("/cart") ||
          path.startsWith("/settings")
        ) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes, except you might want to protect some)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

