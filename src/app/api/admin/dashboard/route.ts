import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalSolutions, publishedPosts, openJobs, newLeadsThisWeek, recentLeads] =
      await Promise.all([
        // Total solutions (published + draft)
        db.solution.count(),

        // Published posts
        db.post.count({
          where: { status: 'PUBLISHED' },
        }),

        // Open jobs
        db.job.count({
          where: { status: 'OPEN' },
        }),

        // New leads this week
        db.lead.count({
          where: {
            createdAt: {
              gte: oneWeekAgo,
            },
          },
        }),

        // 5 most recent leads
        db.lead.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            source: true,
            createdAt: true,
          },
        }),
      ]);

    // Lead counts by source
    const leadsBySource = await db.lead.groupBy({
      by: ['source'],
      _count: { id: true },
    });

    // Post counts by type
    const postsByType = await db.post.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { status: 'PUBLISHED' },
    });

    return NextResponse.json({
      stats: {
        totalSolutions,
        publishedPosts,
        openJobs,
        newLeadsThisWeek,
      },
      recentLeads,
      leadsBySource: leadsBySource.map((l) => ({
        source: l.source,
        count: l._count.id,
      })),
      postsByType: postsByType.map((p) => ({
        type: p.type,
        count: p._count.id,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard stats' },
      { status: 500 },
    );
  }
}
