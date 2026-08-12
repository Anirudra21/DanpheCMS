import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email, message } = body;

    if (!firstName || !lastName || !phone || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // In production this would save to a database
    // For now, log and return success
    console.log('Contact form submission:', {
      firstName,
      lastName,
      phone,
      email,
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Message received successfully' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
