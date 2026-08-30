import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { logActivity } from '@/lib/activity-log';

/**
 * GET /api/seo/pages/[id] — fetch a single SeoPageMeta record.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const page = await db.seoPageMeta.findUnique({ where: { id } });
    if (!page) {
      return NextResponse.json({ error: 'SEO page meta not found' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error('SEO page GET error:', error);
    return NextResponse.json({ error: 'Failed to load SEO page meta' }, { status: 500 });
  }
}

/**
 * PATCH /api/seo/pages/[id] — update a SeoPageMeta record.
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

    const existing = await db.seoPageMeta.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'SEO page meta not found' }, { status: 404 });
    }

    const updated = await db.seoPageMeta.update({
      where: { id },
      data: {
        ...(body.pageTitle !== undefined && { pageTitle: String(body.pageTitle ?? '') }),
        ...(body.metaTitle !== undefined && { metaTitle: String(body.metaTitle ?? '') }),
        ...(body.metaDesc !== undefined && { metaDesc: String(body.metaDesc ?? '') }),
        ...(body.canonicalUrl !== undefined && { canonicalUrl: String(body.canonicalUrl ?? '') }),
        ...(body.ogImageUrl !== undefined && { ogImageUrl: String(body.ogImageUrl ?? '') }),
      },
    });

    await logActivity(request, 'UPDATE', 'SeoPageMeta', id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('SEO page PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update SEO page meta' }, { status: 500 });
  }
}

/**
 * DELETE /api/seo/pages/[id] — delete a SeoPageMeta record.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const err = requireAdmin(request);
    if (err) return err;

    const { id } = await params;
    const existing = await db.seoPageMeta.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'SEO page meta not found' }, { status: 404 });
    }

    await db.seoPageMeta.delete({ where: { id } });
    await logActivity(request, 'DELETE', 'SeoPageMeta', id, { pageTitle: existing.pageTitle });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SEO page DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete SEO page meta' }, { status: 500 });
  }
}
