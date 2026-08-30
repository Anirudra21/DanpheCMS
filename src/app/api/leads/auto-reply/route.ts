import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSystemConfig, setSystemConfig, DEFAULT_AUTO_REPLY, type AutoReplyConfig } from '@/lib/system-config';

/**
 * GET /api/leads/auto-reply — fetch auto-reply template config
 */
export async function GET(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const config = await getSystemConfig<AutoReplyConfig>('auto_reply', DEFAULT_AUTO_REPLY);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Auto-reply GET error:', error);
    return NextResponse.json({ error: 'Failed to load auto-reply settings' }, { status: 500 });
  }
}

/**
 * PUT /api/leads/auto-reply — update auto-reply template config
 */
export async function PUT(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const body = await request.json();

    const current = await getSystemConfig<AutoReplyConfig>('auto_reply', DEFAULT_AUTO_REPLY);

    const parseSection = (
      section: 'contact' | 'demo' | 'newsletter',
    ): { subject: string; body: string } => {
      const data = body[section];
      if (data && typeof data === 'object') {
        return {
          subject: typeof data.subject === 'string' ? data.subject : current[section].subject,
          body: typeof data.body === 'string' ? data.body : current[section].body,
        };
      }
      return current[section];
    };

    const updated: AutoReplyConfig = {
      contact: parseSection('contact'),
      demo: parseSection('demo'),
      newsletter: parseSection('newsletter'),
    };

    await setSystemConfig('auto_reply', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Auto-reply PUT error:', error);
    return NextResponse.json({ error: 'Failed to update auto-reply settings' }, { status: 500 });
  }
}
