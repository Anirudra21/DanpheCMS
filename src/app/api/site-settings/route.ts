import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/site-settings — fetch the singleton site settings.
 * If no row exists, creates one with defaults and returns it.
 */
export async function GET() {
  try {
    let settings = await db.siteSetting.findFirst();
    if (!settings) {
      settings = await db.siteSetting.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Site settings GET error:', error);
    return NextResponse.json({ error: 'Failed to load site settings' }, { status: 500 });
  }
}

/**
 * PUT /api/site-settings — update (or create) the singleton site settings.
 * Accepts any subset of fields; only provided fields are updated.
 */
export async function PUT(request: NextRequest) {
  try {
    const err = requireAdmin(request);
    if (err) return err;
    const body = await request.json();

    let settings = await db.siteSetting.findFirst();
    if (!settings) {
      // Create with the provided data
      const created = await db.siteSetting.create({
        data: {
          ...(body.logo !== undefined && { logo: String(body.logo ?? '') }),
          ...(body.email !== undefined && { email: String(body.email ?? '') }),
          ...(body.phone !== undefined && { phone: String(body.phone ?? '') }),
          ...(body.facebookUrl !== undefined && { facebookUrl: String(body.facebookUrl ?? '') }),
          ...(body.instagramUrl !== undefined && { instagramUrl: String(body.instagramUrl ?? '') }),
          ...(body.address !== undefined && { address: String(body.address ?? '') }),
          ...(body.mapEmbedUrl !== undefined && { mapEmbedUrl: String(body.mapEmbedUrl ?? '') }),
          ...(body.footerText !== undefined && { footerText: String(body.footerText ?? '') }),
          ...(body.copyrightText !== undefined && { copyrightText: String(body.copyrightText ?? '') }),
        },
      });
      return NextResponse.json(created);
    }

    // Update existing row — only fields present in the body
    const updated = await db.siteSetting.update({
      where: { id: settings.id },
      data: {
        ...(body.logo !== undefined && { logo: String(body.logo ?? '') }),
        ...(body.email !== undefined && { email: String(body.email ?? '') }),
        ...(body.phone !== undefined && { phone: String(body.phone ?? '') }),
        ...(body.facebookUrl !== undefined && { facebookUrl: String(body.facebookUrl ?? '') }),
        ...(body.instagramUrl !== undefined && { instagramUrl: String(body.instagramUrl ?? '') }),
        ...(body.address !== undefined && { address: String(body.address ?? '') }),
        ...(body.mapEmbedUrl !== undefined && { mapEmbedUrl: String(body.mapEmbedUrl ?? '') }),
        ...(body.footerText !== undefined && { footerText: String(body.footerText ?? '') }),
        ...(body.copyrightText !== undefined && { copyrightText: String(body.copyrightText ?? '') }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Site settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}
