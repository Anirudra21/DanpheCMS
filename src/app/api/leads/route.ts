import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schemas ──────────────────────────────────────────────────────────

const leadSourceEnum = z.enum(['CONTACT', 'DEMO_REQUEST', 'NEWSLETTER']);

const contactLeadSchema = z.object({
  source: z.literal('CONTACT'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(30),
  message: z.string().min(1, 'Message is required').max(5000),
});

const demoLeadSchema = z.object({
  source: z.literal('DEMO_REQUEST'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(30),
  country: z.string().min(1, 'Country is required').max(100),
  address: z.string().min(1, 'Address is required').max(300),
  organizationName: z.string().min(1, 'Organization name is required').max(200),
  hospitalSize: z.string().max(100).optional().default(''),
  hospitalType: z.string().min(1, 'Hospital type is required').max(100),
  message: z.string().max(5000).optional().default(''),
});

const newsletterLeadSchema = z.object({
  source: z.literal('NEWSLETTER'),
  email: z.string().email('Invalid email address'),
});

const leadCreateSchema = z.discriminatedUnion('source', [
  contactLeadSchema,
  demoLeadSchema,
  newsletterLeadSchema,
]);

// ─── Email Stub ───────────────────────────────────────────────────────────

async function sendAdminNotification(lead: {
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  createdAt: Date;
  // Extra fields from demo form
  country?: string;
  organizationName?: string;
  hospitalType?: string;
}) {
  // TODO: Replace this stub with real email sending via Resend or Nodemailer.
  // Example with Resend:
  //   import { Resend } from 'resend';
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: 'noreply@danphehealth.com',
  //     to: ['info@danphehealth.com'],
  //     subject: `[${lead.source}] New lead from ${lead.name || lead.email}`,
  //     html: `<p>...</p>`,
  //   });

  console.log('📧 [STUB] Admin notification email would be sent:');
  console.log({
    to: 'info@danphehealth.com',
    subject: `[${lead.source}] New lead from ${lead.name || lead.email}`,
    body: {
      name: lead.name || '—',
      email: lead.email,
      phone: lead.phone || '—',
      source: lead.source,
      organizationName: lead.organizationName || undefined,
      country: lead.country || undefined,
      hospitalType: lead.hospitalType || undefined,
      message: lead.message || '—',
      receivedAt: lead.createdAt.toISOString(),
    },
  });
}

// ─── GET /api/leads ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = {};

    if (source && ['CONTACT', 'DEMO_REQUEST', 'NEWSLETTER'].includes(source)) {
      where.source = source;
    }

    if (from || to) {
      const dateFilter: Record<string, unknown> = {};
      if (from) {
        dateFilter.gte = new Date(from);
      }
      if (to) {
        // Include the entire "to" day by adding 23:59:59.999
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.lte = toDate;
      }
      where.createdAt = dateFilter;
    }

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Leads list error:', error);
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
  }
}

// ─── POST /api/leads ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();

    // Ensure source is present before discriminated union parse
    if (!raw || !raw.source) {
      return NextResponse.json(
        { error: 'Missing required field: source (CONTACT, DEMO_REQUEST, or NEWSLETTER)' },
        { status: 400 },
      );
    }

    const result = leadCreateSchema.safeParse(raw);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed', details: result.error.issues },
        { status: 422 },
      );
    }

    const data = result.data;

    // Build name from firstName/lastName for contact & demo leads
    let name = '';
    if ('firstName' in data && 'lastName' in data) {
      name = `${data.firstName} ${data.lastName}`.trim();
    }

    // Build message with extra context for demo leads
    let message = '';
    if (data.source === 'CONTACT') {
      message = data.message;
    } else if (data.source === 'DEMO_REQUEST') {
      const parts: string[] = [];
      if (data.organizationName) parts.push(`Organization: ${data.organizationName}`);
      if (data.hospitalType) parts.push(`Type: ${data.hospitalType}`);
      if (data.hospitalSize) parts.push(`Size: ${data.hospitalSize}`);
      if (data.country) parts.push(`Country: ${data.country}`);
      if (data.address) parts.push(`Address: ${data.address}`);
      if (data.message) parts.push(`\nMessage: ${data.message}`);
      message = parts.join('\n');
    }

    const lead = await db.lead.create({
      data: {
        name,
        email: data.email,
        phone: ('phone' in data ? data.phone : '').trim(),
        message,
        source: data.source,
      },
    });

    // Fire-and-forget admin email notification
    sendAdminNotification({
      name,
      email: data.email,
      phone: ('phone' in data ? data.phone : '').trim(),
      message,
      source: data.source,
      createdAt: lead.createdAt,
      country: data.source === 'DEMO_REQUEST' ? data.country : undefined,
      organizationName: data.source === 'DEMO_REQUEST' ? data.organizationName : undefined,
      hospitalType: data.source === 'DEMO_REQUEST' ? data.hospitalType : undefined,
    }).catch((err) => {
      console.error('Failed to send admin notification:', err);
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Lead create error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
