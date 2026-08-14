import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/leads/:id — single lead
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Lead get error:', error);
    return NextResponse.json({ error: 'Failed to load lead' }, { status: 500 });
  }
}

/**
 * DELETE /api/leads/:id — delete a lead
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await db.lead.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead delete error:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
