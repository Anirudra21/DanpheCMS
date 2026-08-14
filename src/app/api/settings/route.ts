import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/settings — fetch the singleton site settings
 * Creates a default row if none exists.
 */
export async function GET() {
  try {
    let settings = await db.siteSetting.findFirst();
    if (!settings) {
      settings = await db.siteSetting.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings get error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

/**
 * PUT /api/settings — update the singleton site settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    let settings = await db.siteSetting.findFirst();
    if (!settings) {
      settings = await db.siteSetting.create({ data: {} });
    }

    const updated = await db.siteSetting.update({
      where: { id: settings.id },
      data: {
        ...(body.logo !== undefined && { logo: body.logo ?? '' }),
        ...(body.email !== undefined && { email: body.email ?? '' }),
        ...(body.phone !== undefined && { phone: body.phone ?? '' }),
        ...(body.facebookUrl !== undefined && { facebookUrl: body.facebookUrl ?? '' }),
        ...(body.instagramUrl !== undefined && { instagramUrl: body.instagramUrl ?? '' }),
        ...(body.address !== undefined && { address: body.address ?? '' }),
        ...(body.mapEmbedUrl !== undefined && { mapEmbedUrl: body.mapEmbedUrl ?? '' }),
        ...(body.footerText !== undefined && { footerText: body.footerText ?? '' }),
        ...(body.copyrightText !== undefined && { copyrightText: body.copyrightText ?? '' }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
