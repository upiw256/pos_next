import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role hierarchy - higher index = more permissions
const ROLE_LEVELS: Record<string, number> = {
  cashier: 1,
  inventory_manager: 2,
  manager: 3,
  super_admin: 4,
};

// Route access config: minimum required role level
const ROUTE_PERMISSIONS: { pattern: RegExp; minLevel: number }[] = [
  // Cashier-only routes
  { pattern: /^\/admin\/cashier/, minLevel: 1 },
  // Inventory Manager + above
  { pattern: /^\/admin\/inventory/, minLevel: 2 },
  { pattern: /^\/admin\/purchases/, minLevel: 2 },
  { pattern: /^\/admin\/products/, minLevel: 2 },
  // Manager + above
  { pattern: /^\/admin\/categories/, minLevel: 3 },
  { pattern: /^\/admin\/units/, minLevel: 3 },
  { pattern: /^\/admin\/brands/, minLevel: 3 },
  { pattern: /^\/admin\/suppliers/, minLevel: 3 },
  { pattern: /^\/admin\/customers/, minLevel: 3 },
  { pattern: /^\/admin\/expenses/, minLevel: 3 },
  { pattern: /^\/admin\/reports/, minLevel: 3 },
  { pattern: /^\/admin\/sales/, minLevel: 3 },
  // Super Admin only
  { pattern: /^\/admin\/users/, minLevel: 4 },
  { pattern: /^\/admin\/settings/, minLevel: 4 },
];

export function canAccess(role: string, path: string): boolean {
  const userLevel = ROLE_LEVELS[role] ?? 0;
  for (const { pattern, minLevel } of ROUTE_PERMISSIONS) {
    if (pattern.test(path)) {
      return userLevel >= minLevel;
    }
  }
  // Default: any authenticated user can access /admin
  return userLevel >= 1;
}

export default auth((req: any) => {
  const { pathname } = req.nextUrl;

  // Public routes - no auth needed
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Must be logged in for all /admin routes
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = (req.auth as any)?.user?.role ?? "";
    if (!canAccess(role, pathname)) {
      // Redirect to dashboard with access denied
      const dashUrl = new URL("/admin?error=forbidden", req.url);
      return NextResponse.redirect(dashUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
