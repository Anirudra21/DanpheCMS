import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/globe-countries/:id — single country
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const country = await db.globeCountry.findUnique({ where: { id } });
    if (!country) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(country);
  } catch (error) {
    console.error('Globe country get error:', error);
    return NextResponse.json({ error: 'Failed to load country' }, { status: 500 });
  }
}

/**
 * PUT /api/globe-countries/:id — update country
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const data = await request.json();
    const { countryName, latitude, longitude, hospitalCount, displayLabel, isHighlighted, isActive, order } = data;

    if (!countryName?.trim()) {
      return NextResponse.json({ error: 'Country name is required' }, { status: 400 });
    }

    const country = await db.globeCountry.update({
      where: { id },
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

    return NextResponse.json(country);
  } catch (error) {
    console.error('Globe country update error:', error);
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 });
  }
}

/**
 * DELETE /api/globe-countries/:id — delete country
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await db.globeCountry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Globe country delete error:', error);
    return NextResponse.json({ error: 'Failed to delete country' }, { status: 500 });
  }
}
