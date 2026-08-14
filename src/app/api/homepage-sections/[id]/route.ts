import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/homepage-sections/:id — single section
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const section = await db.homepageSection.findUnique({ where: { id } });
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    return NextResponse.json(section);
  } catch (error) {
    console.error('Homepage section get error:', error);
    return NextResponse.json({ error: 'Failed to load section' }, { status: 500 });
  }
}

/**
 * PUT /api/homepage-sections/:id — update a section's editable fields
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { heading, subheading, body: sectionBody, image, ctaLabel, ctaUrl } = body;

    const existing = await db.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const section = await db.homepageSection.update({
      where: { id },
      data: {
        ...(heading !== undefined && { heading }),
        ...(subheading !== undefined && { subheading }),
        ...(sectionBody !== undefined && { body: sectionBody }),
        ...(image !== undefined && { image }),
        ...(ctaLabel !== undefined && { ctaLabel }),
        ...(ctaUrl !== undefined && { ctaUrl }),
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Homepage section update error:', error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}
