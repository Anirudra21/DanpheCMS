import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/stats — list all stats ordered by `order`
 */
export async function GET() {
  try {
    const stats = await db.stat.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats list error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}

/**
 * POST /api/stats — create a new stat
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { label, value, suffix, order } = data;

    if (!label?.trim()) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 });
    }
    if (!value?.trim()) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 });
    }

    const stat = await db.stat.create({
      data: {
        label: label.trim(),
        value: value.trim(),
        suffix: suffix?.trim() ?? '',
        order: typeof order === 'number' ? order : 0,
      },
    });

    return NextResponse.json(stat, { status: 201 });
  } catch (error) {
    console.error('Stat create error:', error);
    return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 });
  }
}

/**
 * PUT /api/stats — bulk reorder (expects { items: [{id, order}] })
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
        db.stat.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stat reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder stats' }, { status: 500 });
  }
}
