import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Define route types
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isRootRoute = request.nextUrl.pathname === "/";

  // We no longer need a separate guide route check since it's part of the dashboard
  const isPublicRoute = isRootRoute;

  // Public routes are always accessible to everyone - no redirects
  if (isPublicRoute) {
    return res;
  }

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("session", session);

  // If user is not signed in and tries to access the dashboard or other protected routes
  if (isProtectedRoute && !session) {
    // Redirect to login page
    const redirectUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and tries to access auth pages, redirect to dashboard
  if (isAuthRoute && session) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Specify the paths for which the middleware will run
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
