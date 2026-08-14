import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/client-logos — list all client logos ordered by `order`
 */
export async function GET() {
  try {
    const logos = await db.clientLogo.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(logos);
  } catch (error) {
    console.error('ClientLogos list error:', error);
    return NextResponse.json({ error: 'Failed to load client logos' }, { status: 500 });
  }
}

/**
 * POST /api/client-logos — create a new client logo
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, logoUrl, order, showOnHomepage, isPublished } = data;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const logo = await db.clientLogo.create({
      data: {
        name: name.trim(),
        logoUrl: logoUrl?.trim() ?? '',
        order: typeof order === 'number' ? order : 0,
        showOnHomepage: showOnHomepage !== false,
        isPublished: isPublished === true,
      },
    });

    return NextResponse.json(logo, { status: 201 });
  } catch (error) {
    console.error('ClientLogo create error:', error);
    return NextResponse.json({ error: 'Failed to create client logo' }, { status: 500 });
  }
}

/**
 * PUT /api/client-logos — bulk reorder (expects { items: [{id, order}] })
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
        db.clientLogo.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ClientLogo reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder client logos' }, { status: 500 });
  }
}
