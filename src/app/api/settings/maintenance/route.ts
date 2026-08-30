import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { getSystemConfig, setSystemConfig, DEFAULT_MAINTENANCE, type MaintenanceConfig } from '@/lib/system-config';

/**
 * GET /api/settings/maintenance — fetch maintenance config (SUPER_ADMIN only)
 */
export async function GET(request: NextRequest) {
  const err = requireSuperAdmin(request);
  if (err) return err;

  try {
    const config = await getSystemConfig<MaintenanceConfig>('maintenance', DEFAULT_MAINTENANCE);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Maintenance GET error:', error);
    return NextResponse.json({ error: 'Failed to load maintenance settings' }, { status: 500 });
  }
}

/**
 * PUT /api/settings/maintenance — update maintenance config (SUPER_ADMIN only)
 */
export async function PUT(request: NextRequest) {
  const err = requireSuperAdmin(request);
  if (err) return err;

  try {
    const body = await request.json();

    const current = await getSystemConfig<MaintenanceConfig>('maintenance', DEFAULT_MAINTENANCE);
    const updated: MaintenanceConfig = {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : current.enabled,
      heading: typeof body.heading === 'string' ? body.heading : current.heading,
      message: typeof body.message === 'string' ? body.message : current.message,
      returnTime: typeof body.returnTime === 'string' ? body.returnTime : current.returnTime,
      ipAllowlist: typeof body.ipAllowlist === 'string' ? body.ipAllowlist : current.ipAllowlist,
    };

    await setSystemConfig('maintenance', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Maintenance PUT error:', error);
    return NextResponse.json({ error: 'Failed to update maintenance settings' }, { status: 500 });
  }
}
