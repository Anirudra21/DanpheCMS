import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/navigation — list all nav items ordered by location then order
 */
export async function GET() {
  try {
    const items = await db.navItem.findMany({
      orderBy: [{ location: 'asc' }, { order: 'asc' }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Navigation list error:', error);
    return NextResponse.json({ error: 'Failed to load navigation items' }, { status: 500 });
  }
}

/**
 * POST /api/navigation — create a new nav item
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
    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    const validLocations = ['HEADER', 'FOOTER_COMPANY', 'FOOTER_SOLUTIONS', 'FOOTER_INFO'];
    if (!validLocations.includes(location)) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }

    const navItem = await db.navItem.create({
      data: {
        label: label.trim(),
        url: url.trim(),
        location,
        order: typeof order === 'number' ? order : 0,
      },
    });

    return NextResponse.json(navItem, { status: 201 });
  } catch (error) {
    console.error('Navigation create error:', error);
    return NextResponse.json({ error: 'Failed to create navigation item' }, { status: 500 });
  }
}

/**
 * PUT /api/navigation — bulk reorder (expects { items: [{id, order}] })
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
        db.navItem.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Navigation reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder navigation items' }, { status: 500 });
  }
}
