import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/cms-utils';

/**
 * GET /api/solutions/:id — single solution with features
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const solution = await db.solution.findUnique({
      where: { id },
      include: {
        features: { orderBy: { order: 'asc' } },
      },
    });

    if (!solution) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    return NextResponse.json(solution);
  } catch (error) {
    console.error('Solution get error:', error);
    return NextResponse.json({ error: 'Failed to load solution' }, { status: 500 });
  }
}

/**
 * PUT /api/solutions/:id — update a solution
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, shortDescription, body: solutionBody, iconUrl, heroImageUrl, order, isPublished, features } = body;

    // Verify exists
    const existing = await db.solution.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    // Check slug uniqueness if changed
    const finalSlug = slug?.trim() || (title ? slugify(title) : existing.slug);
    if (finalSlug !== existing.slug) {
      const slugExists = await db.solution.findUnique({ where: { slug: finalSlug } });
      if (slugExists) {
        return NextResponse.json({ error: 'A solution with this slug already exists' }, { status: 409 });
      }
    }

    // If features are provided, sync them (delete old, create new)
    if (Array.isArray(features)) {
      await db.solutionFeature.deleteMany({ where: { solutionId: id } });
      if (features.length > 0) {
        await db.solutionFeature.createMany({
          data: features.map((f: { label: string; order?: number }, idx: number) => ({
            label: f.label?.trim(),
            order: f.order ?? idx + 1,
            solutionId: id,
          })),
        });
      }
    }

    const solution = await db.solution.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug: finalSlug }),
        ...(shortDescription !== undefined && { shortDescription: shortDescription?.trim() ?? '' }),
        ...(solutionBody !== undefined && { body: solutionBody ?? '' }),
        ...(iconUrl !== undefined && { iconUrl: iconUrl ?? '' }),
        ...(heroImageUrl !== undefined && { heroImageUrl: heroImageUrl ?? '' }),
        ...(order !== undefined && { order: typeof order === 'number' ? order : existing.order }),
        ...(isPublished !== undefined && { isPublished: isPublished === true }),
      },
      include: { features: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(solution);
  } catch (error) {
    console.error('Solution update error:', error);
    return NextResponse.json({ error: 'Failed to update solution' }, { status: 500 });
  }
}

/**
 * DELETE /api/solutions/:id — delete a solution and its features
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.solution.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    // Features are cascade-deleted by Prisma schema
    await db.solution.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Solution delete error:', error);
    return NextResponse.json({ error: 'Failed to delete solution' }, { status: 500 });
  }
}
