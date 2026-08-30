import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { logActivity } from '@/lib/activity-log';

/**
 * GET /api/seo/redirects — list all redirect rules.
 */
export async function GET() {
  try {
    const redirects = await db.redirectRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(redirects);
  } catch (error) {
    console.error('SEO redirects GET error:', error);
    return NextResponse.json({ error: 'Failed to load redirect rules' }, { status: 500 });
  }
}

/**
 * POST /api/seo/redirects — create a new redirect rule.
 */
export async function POST(request: NextRequest) {
  try {
    const err = requireAdmin(request);
    if (err) return err;

    const body = await request.json();
    const { fromPath, toPath, type, enabled } = body;

    if (!fromPath || !toPath) {
      return NextResponse.json(
        { error: 'fromPath and toPath are required' },
        { status: 400 },
      );
    }

    const validTypes = ['PERMANENT_301', 'TEMPORARY_302'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'type must be PERMANENT_301 or TEMPORARY_302' },
        { status: 400 },
      );
    }

    const redirect = await db.redirectRule.create({
      data: {
        fromPath: String(fromPath),
        toPath: String(toPath),
        type: (type as 'PERMANENT_301' | 'TEMPORARY_302') ?? 'PERMANENT_301',
        enabled: enabled !== undefined ? Boolean(enabled) : true,
      },
    });

    await logActivity(request, 'CREATE', 'RedirectRule', redirect.id, { fromPath, toPath, type });
    return NextResponse.json(redirect, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'A redirect rule with this fromPath already exists' },
        { status: 409 },
      );
    }
    console.error('SEO redirects POST error:', error);
    return NextResponse.json({ error: 'Failed to create redirect rule' }, { status: 500 });
  }
}
