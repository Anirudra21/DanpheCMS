import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy /api/contact route — redirects to /api/leads with source=CONTACT.
 * Kept for backwards compatibility in case any external integrations reference it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email, message } = body;

    if (!firstName || !lastName || !phone || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 },
      );
    }

    // Forward to /api/leads with the correct source
    const res = await fetch(new URL('/api/leads', req.url).href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'CONTACT', firstName, lastName, phone, email, message }),
    });

    const data = await res.json();
    return NextResponse.json({ success: res.ok, ...data }, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 },
    );
  }
}
