import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const VALID_LOCATIONS = ['HEADER', 'FOOTER_COMPANY', 'FOOTER_SOLUTIONS', 'FOOTER_INFO'] as const;

/**
 * GET /api/nav-items — list all nav items ordered by location then order
 */
export async function GET() {
  try {
    const items = await db.navItem.findMany({
      orderBy: [{ location: 'asc' }, { order: 'asc' }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('NavItems list error:', error);
    return NextResponse.json({ error: 'Failed to load nav items' }, { status: 500 });
  }
}

/**
 * POST /api/nav-items — create a new nav item
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { label, url, location, order } = data;

    if (!label?.trim()) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 });
    }

    if (!url?.trim()) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!location || !VALID_LOCATIONS.includes(location)) {
      return NextResponse.json(
        { error: 'Location must be one of: HEADER, FOOTER_COMPANY, FOOTER_SOLUTIONS, FOOTER_INFO' },
        { status: 400 },
      );
    }

    const navItem = await db.navItem.create({
      data: {
        label: label.trim(),
        url: url.trim(),
        location: location as 'HEADER' | 'FOOTER_COMPANY' | 'FOOTER_SOLUTIONS' | 'FOOTER_INFO',
        order: typeof order === 'number' ? order : 0,
      },
    });

    return NextResponse.json(navItem, { status: 201 });
  } catch (error) {
    console.error('NavItem create error:', error);
    return NextResponse.json({ error: 'Failed to create nav item' }, { status: 500 });
  }
}

/**
 * PUT /api/nav-items — bulk reorder (expects { items: [{id, order}] })
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    // Update each item's order in a transaction
    await db.$transaction(
      items.map((item: { id: string; order: number }) =>
        db.navItem.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('NavItem reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder nav items' }, { status: 500 });
  }
}
