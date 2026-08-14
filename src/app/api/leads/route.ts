import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/leads — list all leads ordered by `createdAt` desc.
 * Supports ?source=CONTACT or ?source=DEMO_REQUEST or ?source=NEWSLETTER filter.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    const where = source ? { source: source as 'CONTACT' | 'DEMO_REQUEST' | 'NEWSLETTER' } : {};

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Leads list error:', error);
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
  }
}

/**
 * POST /api/leads — create a lead (from contact form)
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, phone, message, source } = data;

    if (!source || !['CONTACT', 'DEMO_REQUEST', 'NEWSLETTER'].includes(source)) {
      return NextResponse.json({ error: 'Source is required (CONTACT, DEMO_REQUEST, or NEWSLETTER)' }, { status: 400 });
    }

    const lead = await db.lead.create({
      data: {
        name: name?.trim() ?? '',
        email: email?.trim() ?? '',
        phone: phone?.trim() ?? '',
        message: message?.trim() ?? '',
        source,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Lead create error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
