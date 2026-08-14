import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/jobs/:id — single job
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const job = await db.job.findUnique({ where: { id } });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Job get error:', error);
    return NextResponse.json({ error: 'Failed to load job' }, { status: 500 });
  }
}

/**
 * PUT /api/jobs/:id — update a job
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, department, location, employmentType, description, requirements, applyEmail, status } = body;

    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = await db.job.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(department !== undefined && { department: department?.trim() ?? '' }),
        ...(location !== undefined && { location: location?.trim() ?? '' }),
        ...(employmentType !== undefined && { employmentType: employmentType?.trim() ?? '' }),
        ...(description !== undefined && { description: description ?? '' }),
        ...(requirements !== undefined && { requirements: requirements ?? '' }),
        ...(applyEmail !== undefined && { applyEmail: applyEmail?.trim() ?? '' }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Job update error:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

/**
 * DELETE /api/jobs/:id — delete a job
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await db.job.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Job delete error:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
