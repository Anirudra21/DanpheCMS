import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/users — list all admin users (exclude passwordHash)
 * Requires SUPER_ADMIN role.
 */
export async function GET() {
  try {
    const err = requireAdmin(request);
    if (err) return err;
    const users = await db.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Users list error:', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

/**
 * POST /api/users — create a new admin user
 * Requires SUPER_ADMIN role.
 */
export async function POST(request: NextRequest) {
  try {
    const err = requireAdmin(request);
    if (err) return err;
    const data = await request.json();
    const { email, name, password, role } = data;

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.trim().length < 8) {
      return NextResponse.json({ error: 'Password is required and must be at least 8 characters' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Unique email check
    const existing = await db.adminUser.findUnique({ where: { email: trimmedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);

    const user = await db.adminUser.create({
      data: {
        email: trimmedEmail,
        name: name?.trim() ?? '',
        passwordHash,
        role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'EDITOR',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('User create error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
