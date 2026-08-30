import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSystemConfig, setSystemConfig, DEFAULT_LEAD_NOTIFICATION, type LeadNotificationConfig } from '@/lib/system-config';

/**
 * GET /api/leads/settings — fetch lead notification email config
 */
export async function GET(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const config = await getSystemConfig<LeadNotificationConfig>('lead_notification', DEFAULT_LEAD_NOTIFICATION);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Lead notification GET error:', error);
    return NextResponse.json({ error: 'Failed to load notification settings' }, { status: 500 });
  }
}

/**
 * PUT /api/leads/settings — update lead notification email config
 */
export async function PUT(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const body = await request.json();

    const current = await getSystemConfig<LeadNotificationConfig>('lead_notification', DEFAULT_LEAD_NOTIFICATION);
    const updated: LeadNotificationConfig = {
      contactEmail: typeof body.contactEmail === 'string' ? body.contactEmail : current.contactEmail,
      demoEmail: typeof body.demoEmail === 'string' ? body.demoEmail : current.demoEmail,
      newsletterEmail: typeof body.newsletterEmail === 'string' ? body.newsletterEmail : current.newsletterEmail,
    };

    await setSystemConfig('lead_notification', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Lead notification PUT error:', error);
    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 });
  }
}
