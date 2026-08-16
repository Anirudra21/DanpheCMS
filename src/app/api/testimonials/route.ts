import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/testimonials — list all testimonials ordered by `order`
 */
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Testimonials list error:', error);
    return NextResponse.json({ error: 'Failed to load testimonials' }, { status: 500 });
  }
}

/**
 * POST /api/testimonials — create a new testimonial
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { quote, authorName, authorOrg, imageUrl, order, isPublished } = data;

    if (!quote?.trim()) {
      return NextResponse.json({ error: 'Quote is required' }, { status: 400 });
    }
    if (!authorName?.trim()) {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        quote: quote.trim(),
        authorName: authorName.trim(),
        authorOrg: authorOrg?.trim() ?? '',
        imageUrl: imageUrl ?? '',
        order: typeof order === 'number' ? order : 0,
        isPublished: isPublished === true,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('Testimonial create error:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

/**
 * PUT /api/testimonials — bulk reorder (expects { items: [{id, order}] })
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
        db.testimonial.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Testimonial reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder testimonials' }, { status: 500 });
  }
}
