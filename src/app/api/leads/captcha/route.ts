import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSystemConfig, setSystemConfig, DEFAULT_CAPTCHA, type CaptchaConfig } from '@/lib/system-config';

const VALID_PROVIDERS = ['none', 'recaptcha_v2', 'turnstile'] as const;

/**
 * GET /api/leads/captcha — fetch CAPTCHA config
 */
export async function GET(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const config = await getSystemConfig<CaptchaConfig>('captcha', DEFAULT_CAPTCHA);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Captcha GET error:', error);
    return NextResponse.json({ error: 'Failed to load CAPTCHA settings' }, { status: 500 });
  }
}

/**
 * PUT /api/leads/captcha — update CAPTCHA config
 */
export async function PUT(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const body = await request.json();
    const current = await getSystemConfig<CaptchaConfig>('captcha', DEFAULT_CAPTCHA);

    const provider = typeof body.provider === 'string' && VALID_PROVIDERS.includes(body.provider as (typeof VALID_PROVIDERS)[number])
      ? (body.provider as CaptchaConfig['provider'])
      : current.provider;

    const updated: CaptchaConfig = {
      provider,
      siteKey: typeof body.siteKey === 'string' ? body.siteKey : current.siteKey,
      secretKey: typeof body.secretKey === 'string' ? body.secretKey : current.secretKey,
    };

    await setSystemConfig('captcha', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Captcha PUT error:', error);
    return NextResponse.json({ error: 'Failed to update CAPTCHA settings' }, { status: 500 });
  }
}
