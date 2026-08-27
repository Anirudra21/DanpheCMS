import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * GET /api/globe-countries/public — active countries ordered by `order`
 */
export async function GET() {
  noStore();
  try {
    const countries = await db.globeCountry.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Public globe countries error:', error);
    return NextResponse.json({ error: 'Failed to load countries' }, { status: 500 });
  }
}
