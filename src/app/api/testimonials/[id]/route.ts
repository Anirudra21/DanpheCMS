import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/testimonials/:id — single testimonial
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const testimonial = await db.testimonial.findUnique({ where: { id } });

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Testimonial get error:', error);
    return NextResponse.json({ error: 'Failed to load testimonial' }, { status: 500 });
  }
}

/**
 * PUT /api/testimonials/:id — update a testimonial
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quote, authorName, authorOrg, imageUrl, order, isPublished } = body;

    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    const testimonial = await db.testimonial.update({
      where: { id },
      data: {
        ...(quote !== undefined && { quote: quote.trim() }),
        ...(authorName !== undefined && { authorName: authorName.trim() }),
        ...(authorOrg !== undefined && { authorOrg: authorOrg?.trim() ?? '' }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() ?? '' }),
        ...(order !== undefined && { order: typeof order === 'number' ? order : existing.order }),
        ...(isPublished !== undefined && { isPublished: isPublished === true }),
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Testimonial update error:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

/**
 * DELETE /api/testimonials/:id — delete a testimonial
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    await db.testimonial.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Testimonial delete error:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
