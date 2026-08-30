import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/activity-logs — paginated activity log list with filters
 * Query params: action, resource, search, page, limit
 * Requires authenticated admin.
 */
export async function GET(request: NextRequest) {
  try {
    const err = requireAdmin(request);
    if (err) return err;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const search = searchParams.get('search');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { details: { contains: search } },
        { resource: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
