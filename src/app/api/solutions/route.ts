import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/cms-utils';
import { Prisma } from '@prisma/client';

/**
 * GET /api/solutions — list all solutions ordered by `order`
 */
export async function GET() {
  try {
    const solutions = await db.solution.findMany({
      orderBy: { order: 'asc' },
      include: {
        features: {
          orderBy: { order: 'asc' },
          select: { id: true, label: true, order: true },
        },
      },
    });
    return NextResponse.json(solutions);
  } catch (error) {
    console.error('Solutions list error:', error);
    return NextResponse.json({ error: 'Failed to load solutions' }, { status: 500 });
  }
}

/**
 * POST /api/solutions — create a new solution
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, shortDescription, body, iconUrl, heroImageUrl, order, isPublished, features } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const finalSlug = slug?.trim() || slugify(title);

    // Check slug uniqueness
    const existing = await db.solution.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json({ error: 'A solution with this slug already exists' }, { status: 409 });
    }

    const solution = await db.solution.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        shortDescription: shortDescription?.trim() ?? '',
        body: body ?? '',
        iconUrl: iconUrl ?? '',
        heroImageUrl: heroImageUrl ?? '',
        order: typeof order === 'number' ? order : 0,
        isPublished: isPublished === true,
        features: features && Array.isArray(features) && features.length > 0
          ? {
              create: features.map((f: { label: string; order?: number }, idx: number) => ({
                label: f.label?.trim(),
                order: f.order ?? idx + 1,
              })),
            }
          : undefined,
      },
      include: { features: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(solution, { status: 201 });
  } catch (error) {
    console.error('Solution create error:', error);
    return NextResponse.json({ error: 'Failed to create solution' }, { status: 500 });
  }
}

/**
 * PUT /api/solutions — bulk reorder (expects { items: [{id, order}] })
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    // Update each item's order in a transaction
    await db.$transaction(
      items.map((item: { id: string; order: number }) =>
        db.solution.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Solution reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder solutions' }, { status: 500 });
  }
}
