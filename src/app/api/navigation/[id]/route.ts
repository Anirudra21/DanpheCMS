import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/navigation/:id — single nav item
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const navItem = await db.navItem.findUnique({ where: { id } });

    if (!navItem) {
      return NextResponse.json({ error: 'Navigation item not found' }, { status: 404 });
    }

    return NextResponse.json(navItem);
  } catch (error) {
    console.error('Navigation get error:', error);
    return NextResponse.json({ error: 'Failed to load navigation item' }, { status: 500 });
  }
}

/**
 * PUT /api/navigation/:id — update a nav item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { label, url, location, order } = body;

    const existing = await db.navItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Navigation item not found' }, { status: 404 });
    }

    if (location !== undefined) {
      const validLocations = ['HEADER', 'FOOTER_COMPANY', 'FOOTER_SOLUTIONS', 'FOOTER_INFO'];
      if (!validLocations.includes(location)) {
        return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
      }
    }

    const navItem = await db.navItem.update({
      where: { id },
      data: {
        ...(label !== undefined && { label: label.trim() }),
        ...(url !== undefined && { url: url.trim() }),
        ...(location !== undefined && { location }),
        ...(order !== undefined && { order: typeof order === 'number' ? order : existing.order }),
      },
    });

    return NextResponse.json(navItem);
  } catch (error) {
    console.error('Navigation update error:', error);
    return NextResponse.json({ error: 'Failed to update navigation item' }, { status: 500 });
  }
}

/**
 * DELETE /api/navigation/:id — delete a nav item
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.navItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Navigation item not found' }, { status: 404 });
    }

    await db.navItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Navigation delete error:', error);
    return NextResponse.json({ error: 'Failed to delete navigation item' }, { status: 500 });
  }
}
