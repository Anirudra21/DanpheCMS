import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/stats/:id — single stat
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const stat = await db.stat.findUnique({ where: { id } });

    if (!stat) {
      return NextResponse.json({ error: 'Stat not found' }, { status: 404 });
    }

    return NextResponse.json(stat);
  } catch (error) {
    console.error('Stat get error:', error);
    return NextResponse.json({ error: 'Failed to load stat' }, { status: 500 });
  }
}

/**
 * PUT /api/stats/:id — update a stat
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { label, value, suffix, order } = body;

    const existing = await db.stat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Stat not found' }, { status: 404 });
    }

    const stat = await db.stat.update({
      where: { id },
      data: {
        ...(label !== undefined && { label: label.trim() }),
        ...(value !== undefined && { value: value.trim() }),
        ...(suffix !== undefined && { suffix: suffix?.trim() ?? '' }),
        ...(order !== undefined && { order: typeof order === 'number' ? order : existing.order }),
      },
    });

    return NextResponse.json(stat);
  } catch (error) {
    console.error('Stat update error:', error);
    return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 });
  }
}

/**
 * DELETE /api/stats/:id — delete a stat
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.stat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Stat not found' }, { status: 404 });
    }

    await db.stat.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stat delete error:', error);
    return NextResponse.json({ error: 'Failed to delete stat' }, { status: 500 });
  }
}
