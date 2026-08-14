import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/homepage-sections — all sections ordered by `order`
 */
export async function GET() {
  try {
    const sections = await db.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Homepage sections list error:', error);
    return NextResponse.json({ error: 'Failed to load homepage sections' }, { status: 500 });
  }
}

/**
 * PUT /api/homepage-sections — bulk reorder
 * Expects { items: [{id, order}] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    await db.$transaction(
      items.map((item: { id: string; order: number }) =>
        db.homepageSection.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Homepage section reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 });
  }
}
