import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export type AdminRole = 'SUPER_ADMIN' | 'EDITOR';

interface JwtPayload {
  id: string;
  role: AdminRole;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export function getSession(request: NextRequest) {
  return getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
}

/**
 * Require SUPER_ADMIN role. Returns 403 if not authorized.
 */
export function requireSuperAdmin(request: NextRequest) {
  const token = getSession(request);
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = decodeToken(token);
  if (!payload || payload.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Insufficient permissions. SUPER_ADMIN required.' },
      { status: 403 },
    );
  }

  return null; // authorized
}

/**
 * Require any authenticated admin (EDITOR or SUPER_ADMIN).
 * Returns 401 if not authenticated.
 */
export function requireAdmin(request: NextRequest) {
  const token = getSession(request);
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return null; // authorized
}
