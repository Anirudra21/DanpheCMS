import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSystemConfig, setSystemConfig, DEFAULT_FORM_CONFIG, type FormConfig, type FormFieldConfig } from '@/lib/system-config';

/**
 * GET /api/leads/form-config — fetch form field configuration
 */
export async function GET(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const config = await getSystemConfig<FormConfig>('form_config', DEFAULT_FORM_CONFIG);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Form config GET error:', error);
    return NextResponse.json({ error: 'Failed to load form configuration' }, { status: 500 });
  }
}

/**
 * PUT /api/leads/form-config — update form field configuration
 */
export async function PUT(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const body = await request.json();
    const current = await getSystemConfig<FormConfig>('form_config', DEFAULT_FORM_CONFIG);

    const parseFormSection = (
      section: 'contact' | 'demo' | 'newsletter',
    ): Record<string, FormFieldConfig> => {
      const data = body[section];
      if (data && typeof data === 'object') {
        const result: Record<string, FormFieldConfig> = {};
        for (const [key, currentField] of Object.entries(current[section])) {
          const incoming = (data as Record<string, unknown>)[key];
          if (incoming && typeof incoming === 'object') {
            result[key] = {
              label: typeof (incoming as Record<string, unknown>).label === 'string'
                ? (incoming as Record<string, unknown>).label as string
                : currentField.label,
              required: typeof (incoming as Record<string, unknown>).required === 'boolean'
                ? (incoming as Record<string, unknown>).required as boolean
                : currentField.required,
            };
          } else {
            result[key] = currentField;
          }
        }
        return result;
      }
      return current[section];
    };

    const updated: FormConfig = {
      contact: parseFormSection('contact'),
      demo: parseFormSection('demo'),
      newsletter: parseFormSection('newsletter'),
    };

    await setSystemConfig('form_config', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Form config PUT error:', error);
    return NextResponse.json({ error: 'Failed to update form configuration' }, { status: 500 });
  }
}
