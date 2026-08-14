import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      totalSolutions,
      publishedPosts,
      openJobs,
      newLeadsThisWeek,
      recentLeads,
      totalLeads,
      totalTeamMembers,
      leadsBySource,
      postsByType,
    ] = await Promise.all([
      db.solution.count(),
      db.post.count({ where: { status: 'PUBLISHED' } }),
      db.job.count({ where: { status: 'OPEN' } }),
      db.lead.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      db.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, source: true, createdAt: true },
      }),
      db.lead.count(),
      db.teamMember.count(),
      db.lead.groupBy({ by: ['source'], _count: { id: true } }),
      db.post.groupBy({ by: ['type'], _count: { id: true }, where: { status: 'PUBLISHED' } }),
    ]);

    return NextResponse.json({
      stats: { totalSolutions, publishedPosts, openJobs, newLeadsThisWeek },
      recentLeads,
      totalLeads,
      totalTeamMembers,
      leadsBySource: leadsBySource.map((l) => ({ source: l.source, count: l._count.id })),
      postsByType: postsByType.map((p) => ({ type: p.type, count: p._count.id })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
