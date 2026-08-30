import { getSystemConfig, DEFAULT_MAINTENANCE, type MaintenanceConfig } from '@/lib/system-config';
import { NextResponse } from 'next/server';

/**
 * GET /api/settings/maintenance/status — public endpoint, no auth required.
 * Returns only whether maintenance mode is enabled.
 */
export async function GET() {
  try {
    const config = await getSystemConfig<MaintenanceConfig>('maintenance', DEFAULT_MAINTENANCE);
    return NextResponse.json({ enabled: Boolean(config.enabled) });
  } catch (error) {
    console.error('Maintenance status GET error:', error);
    return NextResponse.json({ enabled: false });
  }
}
