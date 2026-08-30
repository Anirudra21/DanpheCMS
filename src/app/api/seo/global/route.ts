import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { logActivity } from '@/lib/activity-log';

/**
 * GET /api/seo/global — fetch the singleton SEO global settings.
 * If no row exists, creates one with defaults and returns it.
 */
export async function GET() {
  try {
    let settings = await db.seoGlobal.findFirst();
    if (!settings) {
      settings = await db.seoGlobal.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('SEO global GET error:', error);
    return NextResponse.json({ error: 'Failed to load SEO settings' }, { status: 500 });
  }
}

/**
 * PUT /api/seo/global — update (or create) the singleton SEO global settings.
 */
export async function PUT(request: NextRequest) {
  try {
    const err = requireAdmin(request);
    if (err) return err;

    const body = await request.json();

    let settings = await db.seoGlobal.findFirst();
    if (!settings) {
      const created = await db.seoGlobal.create({
        data: {
          ...(body.titleTemplate !== undefined && { titleTemplate: String(body.titleTemplate ?? '') }),
          ...(body.metaDescription !== undefined && { metaDescription: String(body.metaDescription ?? '') }),
          ...(body.ogImageUrl !== undefined && { ogImageUrl: String(body.ogImageUrl ?? '') }),
          ...(body.faviconUrl !== undefined && { faviconUrl: String(body.faviconUrl ?? '') }),
          ...(body.googleVerify !== undefined && { googleVerify: String(body.googleVerify ?? '') }),
          ...(body.bingVerify !== undefined && { bingVerify: String(body.bingVerify ?? '') }),
          ...(body.faqSchemaEnabled !== undefined && { faqSchemaEnabled: Boolean(body.faqSchemaEnabled) }),
          ...(body.robotsTxt !== undefined && { robotsTxt: String(body.robotsTxt ?? '') }),
          ...(body.sitemapUrl !== undefined && { sitemapUrl: String(body.sitemapUrl ?? '') }),
        },
      });
      await logActivity(request, 'CREATE', 'SeoGlobal', created.id, { titleTemplate: body.titleTemplate });
      return NextResponse.json(created);
    }

    const updated = await db.seoGlobal.update({
      where: { id: settings.id },
      data: {
        ...(body.titleTemplate !== undefined && { titleTemplate: String(body.titleTemplate ?? '') }),
        ...(body.metaDescription !== undefined && { metaDescription: String(body.metaDescription ?? '') }),
        ...(body.ogImageUrl !== undefined && { ogImageUrl: String(body.ogImageUrl ?? '') }),
        ...(body.faviconUrl !== undefined && { faviconUrl: String(body.faviconUrl ?? '') }),
        ...(body.googleVerify !== undefined && { googleVerify: String(body.googleVerify ?? '') }),
        ...(body.bingVerify !== undefined && { bingVerify: String(body.bingVerify ?? '') }),
        ...(body.faqSchemaEnabled !== undefined && { faqSchemaEnabled: Boolean(body.faqSchemaEnabled) }),
        ...(body.robotsTxt !== undefined && { robotsTxt: String(body.robotsTxt ?? '') }),
        ...(body.sitemapUrl !== undefined && { sitemapUrl: String(body.sitemapUrl ?? '') }),
      },
    });

    await logActivity(request, 'UPDATE', 'SeoGlobal', updated.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('SEO global PUT error:', error);
    return NextResponse.json({ error: 'Failed to update SEO settings' }, { status: 500 });
  }
}
