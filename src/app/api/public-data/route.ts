import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public-data
 * Aggregates all publicly-readable data in a single request so the
 * client shell (header, footer, homepage, etc.) can hydrate in one fetch.
 */
export async function GET() {
  try {
    const [
      settings,
      navItems,
      homepageSections,
      stats,
      solutions,
      testimonials,
      clientLogos,
      teamMembers,
    ] = await Promise.all([
      // Singleton — take first row
      db.siteSetting.findFirst(),
      db.navItem.findMany({
        orderBy: [{ location: 'asc' }, { order: 'asc' }],
      }),
      db.homepageSection.findMany({ orderBy: { order: 'asc' } }),
      db.stat.findMany({ orderBy: { order: 'asc' } }),
      db.solution.findMany({
        where: { isPublished: true },
        include: { features: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      }),
      db.testimonial.findMany({
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      }),
      db.clientLogo.findMany({
        where: { isPublished: true, showOnHomepage: true },
        orderBy: { order: 'asc' },
      }),
      db.teamMember.findMany({
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    // Group nav items by location
    const navByLocation: Record<string, typeof navItems> = {};
    for (const item of navItems) {
      const loc = item.location;
      if (!navByLocation[loc]) navByLocation[loc] = [];
      navByLocation[loc].push(item);
    }

    return NextResponse.json({
      siteSettings: settings,
      navByLocation,
      homepageSections,
      stats,
      solutions,
      testimonials,
      clientLogos,
      teamMembers,
    });
  } catch (error) {
    console.error('public-data error:', error);
    return NextResponse.json({ error: 'Failed to load public data' }, { status: 500 });
  }
}
