import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/seo/pages — list all SeoPageMeta records.
 * Optional ?pageType= filter (HOMEPAGE|SOLUTION|POST|JOB|PAGE)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType');

    const where = pageType ? { pageType: pageType as 'HOMEPAGE' | 'SOLUTION' | 'POST' | 'JOB' | 'PAGE' } : {};

    const pages = await db.seoPageMeta.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('SEO pages GET error:', error);
    return NextResponse.json({ error: 'Failed to load SEO page metas' }, { status: 500 });
  }
}
