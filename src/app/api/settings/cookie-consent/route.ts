import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSystemConfig, setSystemConfig, DEFAULT_COOKIE_CONSENT, type CookieConsentConfig } from '@/lib/system-config';

/**
 * GET /api/settings/cookie-consent — fetch cookie consent config (admin only)
 */
export async function GET(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const config = await getSystemConfig<CookieConsentConfig>('cookie_consent', DEFAULT_COOKIE_CONSENT);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Cookie consent GET error:', error);
    return NextResponse.json({ error: 'Failed to load cookie consent settings' }, { status: 500 });
  }
}

/**
 * PUT /api/settings/cookie-consent — update cookie consent config (admin only)
 */
export async function PUT(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const body = await request.json();

    const current = await getSystemConfig<CookieConsentConfig>('cookie_consent', DEFAULT_COOKIE_CONSENT);
    const updated: CookieConsentConfig = {
      bannerText: typeof body.bannerText === 'string' ? body.bannerText : current.bannerText,
      acceptLabel: typeof body.acceptLabel === 'string' ? body.acceptLabel : current.acceptLabel,
      rejectLabel: typeof body.rejectLabel === 'string' ? body.rejectLabel : current.rejectLabel,
    };

    await setSystemConfig('cookie_consent', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Cookie consent PUT error:', error);
    return NextResponse.json({ error: 'Failed to update cookie consent settings' }, { status: 500 });
  }
}
