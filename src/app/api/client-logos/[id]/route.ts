import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/client-logos/:id — single client logo
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const logo = await db.clientLogo.findUnique({ where: { id } });

    if (!logo) {
      return NextResponse.json({ error: 'Client logo not found' }, { status: 404 });
    }

    return NextResponse.json(logo);
  } catch (error) {
    console.error('ClientLogo get error:', error);
    return NextResponse.json({ error: 'Failed to load client logo' }, { status: 500 });
  }
}

/**
 * PUT /api/client-logos/:id — update a client logo
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, logoUrl, order, showOnHomepage, isPublished } = body;

    const existing = await db.clientLogo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Client logo not found' }, { status: 404 });
    }

    const logo = await db.clientLogo.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() ?? '' }),
        ...(order !== undefined && { order: typeof order === 'number' ? order : existing.order }),
        ...(showOnHomepage !== undefined && { showOnHomepage: showOnHomepage === true }),
        ...(isPublished !== undefined && { isPublished: isPublished === true }),
      },
    });

    return NextResponse.json(logo);
  } catch (error) {
    console.error('ClientLogo update error:', error);
    return NextResponse.json({ error: 'Failed to update client logo' }, { status: 500 });
  }
}

/**
 * DELETE /api/client-logos/:id — delete a client logo
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.clientLogo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Client logo not found' }, { status: 404 });
    }

    await db.clientLogo.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ClientLogo delete error:', error);
    return NextResponse.json({ error: 'Failed to delete client logo' }, { status: 500 });
  }
}
