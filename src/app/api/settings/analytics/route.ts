import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { getSystemConfig, setSystemConfig, DEFAULT_ANALYTICS, type AnalyticsConfig } from '@/lib/system-config';

/**
 * GET /api/settings/analytics — fetch analytics config (SUPER_ADMIN only)
 */
export async function GET(request: NextRequest) {
  const err = requireSuperAdmin(request);
  if (err) return err;

  try {
    const config = await getSystemConfig<AnalyticsConfig>('analytics', DEFAULT_ANALYTICS);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to load analytics settings' }, { status: 500 });
  }
}

/**
 * PUT /api/settings/analytics — update analytics config (SUPER_ADMIN only)
 */
export async function PUT(request: NextRequest) {
  const err = requireSuperAdmin(request);
  if (err) return err;

  try {
    const body = await request.json();

    const current = await getSystemConfig<AnalyticsConfig>('analytics', DEFAULT_ANALYTICS);
    const updated: AnalyticsConfig = {
      googleAnalyticsId: typeof body.googleAnalyticsId === 'string' ? body.googleAnalyticsId : current.googleAnalyticsId,
      gtmContainerId: typeof body.gtmContainerId === 'string' ? body.gtmContainerId : current.gtmContainerId,
      facebookPixelId: typeof body.facebookPixelId === 'string' ? body.facebookPixelId : current.facebookPixelId,
      linkedinInsightId: typeof body.linkedinInsightId === 'string' ? body.linkedinInsightId : current.linkedinInsightId,
    };

    await setSystemConfig('analytics', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Analytics PUT error:', error);
    return NextResponse.json({ error: 'Failed to update analytics settings' }, { status: 500 });
  }
}
