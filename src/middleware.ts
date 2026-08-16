import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ─── Restricted admin paths (SUPER_ADMIN only) ──────────────────────
const SUPER_ADMIN_ONLY_PATHS = ['/admin/users', '/admin/settings'];

/**
 * Decode JWT without full verification (middleware runs every request,
 * so we skip signature check for performance — the session/token is
 * already verified by NextAuth on login).
 */
function decodeToken(token: string): { id: string; role: string } | null {
  try {
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login, unauthorized, and static assets
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/unauthorized') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Not an admin route at all — allow through
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode role from JWT
  const payload = decodeToken(token);
  if (!payload) {
    return NextResponse.next();
  }

  // SUPER_ADMIN-only paths: block EDITORs
  const isRestricted = SUPER_ADMIN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  if (isRestricted && payload.role !== 'SUPER_ADMIN') {
    const unauthorizedUrl = new URL('/admin/unauthorized', request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path((?!login|unauthorized).*)'],
};
