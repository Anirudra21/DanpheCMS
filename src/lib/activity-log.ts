import { db } from '@/lib/db';
import type { NextRequest } from 'next/server';

/**
 * Log an admin activity. Fails silently — never blocks the main flow.
 */
export async function logActivity(
  request: NextRequest | null,
  action: string,
  resource: string,
  resourceId: string = '',
  details: Record<string, unknown> = {},
) {
  try {
    let userId = '';
    let userName = '';

    if (request) {
      const { getToken } = await import('next-auth/jwt');
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userId = (token.id as string) || '';
        userName = (token.name as string) || '';
      }
    }

    await db.activityLog.create({
      data: {
        userId,
        userName,
        action,
        resource,
        resourceId,
        details: JSON.stringify(details),
      },
    });
  } catch {
    // Silent fail — activity logging should never block main operations
  }
}
