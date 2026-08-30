import { db } from '@/lib/db';

// ─── In-memory cache ─────────────────────────────────────────────────────
const cache = new Map<string, unknown>();

/** Get a typed config value from the SystemConfig store */
export async function getSystemConfig<T>(key: string, defaultValue: T): Promise<T> {
  if (cache.has(key)) return cache.get(key) as T;
  const row = await db.systemConfig.findUnique({ where: { key } });
  if (!row) { cache.set(key, defaultValue); return defaultValue; }
  try {
    const parsed = JSON.parse(row.value) as T;
    cache.set(key, parsed);
    return parsed;
  } catch { cache.set(key, defaultValue); return defaultValue; }
}

/** Set a config value (upsert) */
export async function setSystemConfig(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await db.systemConfig.upsert({ where: { key }, update: { value: json }, create: { key, value: json } });
  cache.set(key, value);
}

/** Clear cache (optionally for a specific key) */
export function clearConfigCache(key?: string) {
  if (key) cache.delete(key); else cache.clear();
}

// ─── Typed config interfaces ────────────────────────────────────────────

export interface MaintenanceConfig {
  enabled: boolean;
  heading: string;
  message: string;
  returnTime: string;
  ipAllowlist: string;
}

export const DEFAULT_MAINTENANCE: MaintenanceConfig = {
  enabled: false,
  heading: 'We\'ll Be Back Soon',
  message: 'We\'re performing scheduled maintenance. We\'ll be back up shortly.',
  returnTime: '',
  ipAllowlist: '',
};

export interface AnalyticsConfig {
  googleAnalyticsId: string;
  gtmContainerId: string;
  facebookPixelId: string;
  linkedinInsightId: string;
}

export const DEFAULT_ANALYTICS: AnalyticsConfig = {
  googleAnalyticsId: '',
  gtmContainerId: '',
  facebookPixelId: '',
  linkedinInsightId: '',
};

export interface CookieConsentConfig {
  bannerText: string;
  acceptLabel: string;
  rejectLabel: string;
}

export const DEFAULT_COOKIE_CONSENT: CookieConsentConfig = {
  bannerText: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
  acceptLabel: 'Accept All',
  rejectLabel: 'Reject All',
};

export interface LeadNotificationConfig {
  contactEmail: string;
  demoEmail: string;
  newsletterEmail: string;
}

export const DEFAULT_LEAD_NOTIFICATION: LeadNotificationConfig = {
  contactEmail: '',
  demoEmail: '',
  newsletterEmail: '',
};

export interface AutoReplyConfig {
  contact: { subject: string; body: string };
  demo: { subject: string; body: string };
  newsletter: { subject: string; body: string };
}

export const DEFAULT_AUTO_REPLY: AutoReplyConfig = {
  contact: { subject: 'Thank you for contacting Danphe Health', body: 'Hello {{name}},\n\nThank you for reaching out. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nDanphe Health Team' },
  demo: { subject: 'Your Demo Request has been Received', body: 'Hello {{name}},\n\nThank you for your interest in Danphe HMIS. Our team will contact you shortly to schedule a demo.\n\nBest regards,\nDanphe Health Team' },
  newsletter: { subject: 'Welcome to Danphe Health Newsletter', body: 'Hello {{name}},\n\nYou have been successfully subscribed to the Danphe Health newsletter. Stay tuned for the latest updates!\n\nBest regards,\nDanphe Health Team' },
};

export interface FormFieldConfig {
  label: string;
  required: boolean;
}

export interface FormConfig {
  contact: Record<string, FormFieldConfig>;
  demo: Record<string, FormFieldConfig>;
  newsletter: Record<string, FormFieldConfig>;
}

export const DEFAULT_FORM_CONFIG: FormConfig = {
  contact: {
    name: { label: 'Full Name', required: true },
    email: { label: 'Email Address', required: true },
    phone: { label: 'Phone Number', required: false },
    message: { label: 'Message', required: true },
  },
  demo: {
    name: { label: 'Full Name', required: true },
    email: { label: 'Work Email', required: true },
    phone: { label: 'Phone Number', required: true },
    organization: { label: 'Organization', required: true },
    message: { label: 'Message', required: false },
  },
  newsletter: {
    email: { label: 'Email Address', required: true },
  },
};

export interface CaptchaConfig {
  provider: 'none' | 'recaptcha_v2' | 'turnstile';
  siteKey: string;
  secretKey: string;
}

export const DEFAULT_CAPTCHA: CaptchaConfig = {
  provider: 'none',
  siteKey: '',
  secretKey: '',
};
