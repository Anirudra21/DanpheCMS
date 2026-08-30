import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { logActivity } from '@/lib/activity-log';

/**
 * PATCH /api/seo/redirects/[id] — update a redirect rule.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const err = requireAdmin(request);
    if (err) return err;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.redirectRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Redirect rule not found' }, { status: 404 });
    }

    const validTypes = ['PERMANENT_301', 'TEMPORARY_302'];
    if (body.type && !validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'type must be PERMANENT_301 or TEMPORARY_302' },
        { status: 400 },
      );
    }

    const updated = await db.redirectRule.update({
      where: { id },
      data: {
        ...(body.fromPath !== undefined && { fromPath: String(body.fromPath) }),
        ...(body.toPath !== undefined && { toPath: String(body.toPath) }),
        ...(body.type !== undefined && { type: body.type as 'PERMANENT_301' | 'TEMPORARY_302' }),
        ...(body.enabled !== undefined && { enabled: Boolean(body.enabled) }),
      },
    });

    await logActivity(request, 'UPDATE', 'RedirectRule', id, body);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'A redirect rule with this fromPath already exists' },
        { status: 409 },
      );
    }
    console.error('SEO redirect PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update redirect rule' }, { status: 500 });
  }
}

/**
 * DELETE /api/seo/redirects/[id] — delete a redirect rule.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const err = requireAdmin(request);
    if (err) return err;

    const { id } = await params;
    const existing = await db.redirectRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Redirect rule not found' }, { status: 404 });
    }

    await db.redirectRule.delete({ where: { id } });
    await logActivity(request, 'DELETE', 'RedirectRule', id, { fromPath: existing.fromPath });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SEO redirect DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete redirect rule' }, { status: 500 });
  }
}
