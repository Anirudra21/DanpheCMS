import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/jobs — list all jobs ordered by `postedAt` desc.
 * Supports ?status=OPEN filter.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status: status as 'OPEN' | 'CLOSED' } : {};

    const jobs = await db.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Jobs list error:', error);
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 });
  }
}

/**
 * POST /api/jobs — create a new job
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, department, location, employmentType, description, requirements, applyEmail, status } = data;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const job = await db.job.create({
      data: {
        title: title.trim(),
        department: department?.trim() ?? '',
        location: location?.trim() ?? '',
        employmentType: employmentType?.trim() ?? '',
        description: description ?? '',
        requirements: requirements ?? '',
        applyEmail: applyEmail?.trim() ?? '',
        status: status === 'CLOSED' ? 'CLOSED' : 'OPEN',
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Job create error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

/**
 * PUT /api/jobs — bulk status toggle { ids: string[], status: 'OPEN'|'CLOSED' }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
    }

    if (!['OPEN', 'CLOSED'].includes(status)) {
      return NextResponse.json({ error: 'status must be OPEN or CLOSED' }, { status: 400 });
    }

    await db.job.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Job bulk update error:', error);
    return NextResponse.json({ error: 'Failed to update jobs' }, { status: 500 });
  }
}
