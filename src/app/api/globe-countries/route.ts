import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/globe-countries — list all globe countries (admin)
 */
export async function GET() {
  try {
    const countries = await db.globeCountry.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Globe countries list error:', error);
    return NextResponse.json({ error: 'Failed to load countries' }, { status: 500 });
  }
}

/**
 * POST /api/globe-countries — create a new globe country
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { countryName, latitude, longitude, hospitalCount, displayLabel, isHighlighted, isActive, order } = data;

    if (!countryName?.trim()) {
      return NextResponse.json({ error: 'Country name is required' }, { status: 400 });
    }
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    const country = await db.globeCountry.create({
      data: {
        countryName: countryName.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        hospitalCount: parseInt(hospitalCount, 10) || 0,
        displayLabel: displayLabel?.trim() ?? '',
        isHighlighted: Boolean(isHighlighted),
        isActive: Boolean(isActive),
        order: typeof order === 'number' ? order : 0,
      },
    });

    return NextResponse.json(country, { status: 201 });
  } catch (error) {
    console.error('Globe country create error:', error);
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 });
  }
}

/**
 * PUT /api/globe-countries — bulk reorder (expects { items: [{id, order}] })
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
        db.globeCountry.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Globe country reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder countries' }, { status: 500 });
  }
}
