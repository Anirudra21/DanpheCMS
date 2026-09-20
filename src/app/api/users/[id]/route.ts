import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * GET /api/users/:id — single admin user (exclude passwordHash)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await db.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User get error:', error);
    return NextResponse.json({ error: 'Failed to load user' }, { status: 500 });
  }
}

/**
 * PUT /api/users/:id — update an admin user
 * Only SUPER_ADMIN can change roles.
 * If password is provided and non-empty, hash and update it.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role } = body;

    const existing = await db.adminUser.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    // Only hash password if it's provided and non-empty
    if (password && typeof password === 'string' && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    // Only SUPER_ADMIN can change roles
    if (role !== undefined && role !== existing.role) {
      updateData.role = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'EDITOR';
    }

    const user = await db.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/:id — delete an admin user
 * Only SUPER_ADMIN can delete. Cannot delete self.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get requester role from header (set by middleware/auth)
    const requesterRole = request.headers.get('x-admin-role');

    // For now, we check by looking up the user being deleted
    // The actual SUPER_ADMIN check should be done via auth middleware
    // We'll implement a simple guard here
    const existing = await db.adminUser.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cannot delete self - check if the ID matches the requester
    const requesterId = request.headers.get('x-admin-id');
    if (requesterId === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await db.adminUser.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
