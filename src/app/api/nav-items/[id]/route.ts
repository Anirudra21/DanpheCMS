import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const VALID_LOCATIONS = ['HEADER', 'FOOTER_COMPANY', 'FOOTER_SOLUTIONS', 'FOOTER_INFO'] as const;

/**
 * GET /api/nav-items/:id — single nav item
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const navItem = await db.navItem.findUnique({ where: { id } });

    if (!navItem) {
      return NextResponse.json({ error: 'Nav item not found' }, { status: 404 });
    }

    return NextResponse.json(navItem);
  } catch (error) {
    console.error('NavItem get error:', error);
    return NextResponse.json({ error: 'Failed to load nav item' }, { status: 500 });
  }
}

/**
 * PUT /api/nav-items/:id — update a nav item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { label, url, location, order } = body;

    // Verify exists
    const existing = await db.navItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Nav item not found' }, { status: 404 });
    }

    // Validate location if provided
    if (location !== undefined && !VALID_LOCATIONS.includes(location)) {
      return NextResponse.json(
        { error: 'Location must be one of: HEADER, FOOTER_COMPANY, FOOTER_SOLUTIONS, FOOTER_INFO' },
        { status: 400 },
      );
    }

    const navItem = await db.navItem.update({
      where: { id },
      data: {
        ...(label !== undefined && { label: label.trim() }),
        ...(url !== undefined && { url: url.trim() }),
        ...(location !== undefined && {
          location: location as 'HEADER' | 'FOOTER_COMPANY' | 'FOOTER_SOLUTIONS' | 'FOOTER_INFO',
        }),
        ...(order !== undefined && { order: typeof order === 'number' ? order : existing.order }),
      },
    });

    return NextResponse.json(navItem);
  } catch (error) {
    console.error('NavItem update error:', error);
    return NextResponse.json({ error: 'Failed to update nav item' }, { status: 500 });
  }
}

/**
 * DELETE /api/nav-items/:id — delete a nav item
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.navItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Nav item not found' }, { status: 404 });
    }

    await db.navItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('NavItem delete error:', error);
    return NextResponse.json({ error: 'Failed to delete nav item' }, { status: 500 });
  }
}
