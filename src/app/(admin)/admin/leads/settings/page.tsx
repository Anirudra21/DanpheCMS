'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Loader2,
  Mail,
  CalendarCheck,
  Megaphone,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  Info,
  MessageSquareReply,
  FileText,
  Bot,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ─── Types ────────────────────────────────────────────────────────────────

type LeadNotificationConfig = {
  contactEmail: string;
  demoEmail: string;
  newsletterEmail: string;
};

type AutoReplySection = { subject: string; body: string };

type AutoReplyConfig = {
  contact: AutoReplySection;
  demo: AutoReplySection;
  newsletter: AutoReplySection;
};

type FormFieldConfig = { label: string; required: boolean };

type FormConfig = {
  contact: Record<string, FormFieldConfig>;
  demo: Record<string, FormFieldConfig>;
  newsletter: Record<string, FormFieldConfig>;
};

type CaptchaConfig = {
  provider: 'none' | 'recaptcha_v2' | 'turnstile';
  siteKey: string;
  secretKey: string;
};

// ─── Animation ────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Helper ───────────────────────────────────────────────────────────────

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="bg-danphe-accent hover:bg-danphe-accent/90 text-white"
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Save Changes
    </Button>
  );
}

// ─── Tab 1: Notification Emails ───────────────────────────────────────────

function NotificationTab() {
  const [config, setConfig] = useState<LeadNotificationConfig>({
    contactEmail: '',
    demoEmail: '',
    newsletterEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/leads/settings')
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => toast.error('Failed to load notification settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/leads/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success('Notification emails saved successfully');
    } catch {
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const cards = [
    {
      key: 'contactEmail' as const,
      title: 'Contact Form',
      desc: 'Receive notifications when a visitor submits the contact form.',
      icon: Mail,
    },
    {
      key: 'demoEmail' as const,
      title: 'Demo Request',
      desc: 'Receive notifications when someone requests a product demo.',
      icon: CalendarCheck,
    },
    {
      key: 'newsletterEmail' as const,
      title: 'Newsletter',
      desc: 'Receive notifications when a new subscriber joins the newsletter.',
      icon: Megaphone,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Configure where lead notifications are sent for each form type.
        </p>
        <SaveButton loading={saving} onClick={handleSave} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <motion.div className="grid gap-4 md:grid-cols-3" variants={container} initial="hidden" animate="show">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.key}
                variants={item}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                </div>
                <p className="mb-4 text-xs text-slate-500">{card.desc}</p>
                <Label htmlFor={card.key} className="sr-only">
                  {card.title} Email
                </Label>
                <Input
                  id={card.key}
                  type="email"
                  placeholder="admin@danphehealth.com"
                  value={config[card.key]}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, [card.key]: e.target.value }))
                  }
                  className="border-slate-200"
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// ─── Tab 2: Auto-Reply Templates ─────────────────────────────────────────

function AutoReplyTab() {
  const [config, setConfig] = useState<AutoReplyConfig>({
    contact: { subject: '', body: '' },
    demo: { subject: '', body: '' },
    newsletter: { subject: '', body: '' },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/leads/auto-reply')
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => toast.error('Failed to load auto-reply templates'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/leads/auto-reply', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success('Auto-reply templates saved successfully');
    } catch {
      toast.error('Failed to save auto-reply templates');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (
    section: 'contact' | 'demo' | 'newsletter',
    field: 'subject' | 'body',
    value: string,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const sections = [
    { key: 'contact' as const, title: 'Contact Form Auto-Reply', icon: MessageSquareReply },
    { key: 'demo' as const, title: 'Demo Request Auto-Reply', icon: FileText },
    { key: 'newsletter' as const, title: 'Newsletter Welcome Email', icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Customize auto-reply emails sent to users after form submission.
        </p>
        <SaveButton loading={saving} onClick={handleSave} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <motion.div
          className="rounded-xl border border-slate-200 bg-white p-5"
          variants={item}
          initial="hidden"
          animate="show"
        >
          <Accordion type="multiple" className="w-full">
            {sections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <AccordionItem key={sec.key} value={sec.key}>
                  <AccordionTrigger className="text-sm font-semibold text-slate-900 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-500" />
                      {sec.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${sec.key}-subject`}>Subject</Label>
                        <Input
                          id={`${sec.key}-subject`}
                          value={config[sec.key].subject}
                          onChange={(e) => updateSection(sec.key, 'subject', e.target.value)}
                          className="border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${sec.key}-body`}>Body</Label>
                        <Textarea
                          id={`${sec.key}-body`}
                          rows={8}
                          value={config[sec.key].body}
                          onChange={(e) => updateSection(sec.key, 'body', e.target.value)}
                          className="border-slate-200 font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500">
                          Use{' '}
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">{'{{name}}'}</code>{' '}
                          and{' '}
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">{'{{email}}'}</code>{' '}
                          as placeholders — they will be replaced with the submitter&apos;s information.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>
      )}
    </div>
  );
}

// ─── Tab 3: Form Configuration ───────────────────────────────────────────

function FormConfigTab() {
  const [config, setConfig] = useState<FormConfig>({
    contact: {},
    demo: {},
    newsletter: {},
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/leads/form-config')
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => toast.error('Failed to load form configuration'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/leads/form-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success('Form configuration saved successfully');
    } catch {
      toast.error('Failed to save form configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (
    section: 'contact' | 'demo' | 'newsletter',
    fieldName: string,
    update: Partial<FormFieldConfig>,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [fieldName]: { ...prev[section][fieldName], ...update },
      },
    }));
  };

  const sectionLabels: Record<string, string> = {
    contact: 'Contact Form',
    demo: 'Demo Request',
    newsletter: 'Newsletter',
  };

  const sectionIcons: Record<string, React.ElementType> = {
    contact: Mail,
    demo: CalendarCheck,
    newsletter: Megaphone,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Manage form field labels and required status for each form type.
        </p>
        <SaveButton loading={saving} onClick={handleSave} />
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800">
          Changes to form configuration affect the public-facing forms. Field names
          (shown as code badges) cannot be changed — only display labels and required
          status can be updated.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
          {(Object.keys(sectionLabels) as Array<'contact' | 'demo' | 'newsletter'>).map(
            (section) => {
              const Icon = sectionIcons[section];
              const fields = Object.entries(config[section]);
              return (
                <motion.div
                  key={section}
                  variants={item}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {sectionLabels[section]}
                    </h3>
                  </div>
                  <div className="rounded-lg border border-slate-100">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-100 hover:bg-transparent">
                          <TableHead className="text-xs font-medium text-slate-500">Field</TableHead>
                          <TableHead className="text-xs font-medium text-slate-500">Label</TableHead>
                          <TableHead className="w-28 text-center text-xs font-medium text-slate-500">
                            Required
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map(([fieldName, fieldConfig]) => (
                          <TableRow key={fieldName} className="border-slate-100">
                            <TableCell>
                              <Badge variant="secondary" className="font-mono text-xs">
                                {fieldName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={fieldConfig.label}
                                onChange={(e) =>
                                  updateField(section, fieldName, { label: e.target.value })
                                }
                                className="border-slate-200 h-8 text-sm"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={fieldConfig.required}
                                onCheckedChange={(checked) =>
                                  updateField(section, fieldName, { required: checked })
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              );
            },
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── Tab 4: Spam Protection ──────────────────────────────────────────────

function CaptchaTab() {
  const [config, setConfig] = useState<CaptchaConfig>({
    provider: 'none',
    siteKey: '',
    secretKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/leads/captcha')
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => toast.error('Failed to load CAPTCHA settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/leads/captcha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success('CAPTCHA settings saved successfully');
    } catch {
      toast.error('Failed to save CAPTCHA settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Protect forms from spam and automated submissions.
        </p>
        <SaveButton loading={saving} onClick={handleSave} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <motion.div
          className="rounded-xl border border-slate-200 bg-white p-5"
          variants={item}
          initial="hidden"
          animate="show"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">CAPTCHA Configuration</h3>
              <p className="text-xs text-slate-500">
                Enable CAPTCHA on all public-facing forms.
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="captcha-provider">Provider</Label>
              <Select
                value={config.provider}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    provider: value as CaptchaConfig['provider'],
                  }))
                }
              >
                <SelectTrigger id="captcha-provider" className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="recaptcha_v2">reCAPTCHA v2</SelectItem>
                  <SelectItem value="turnstile">Cloudflare Turnstile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.provider !== 'none' && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="captcha-site-key">Site Key</Label>
                  <Input
                    id="captcha-site-key"
                    placeholder="Enter your site key"
                    value={config.siteKey}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, siteKey: e.target.value }))
                    }
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="captcha-secret-key">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="captcha-secret-key"
                      type={showSecret ? 'text' : 'password'}
                      placeholder="Enter your secret key"
                      value={config.secretKey}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, secretKey: e.target.value }))
                      }
                      className="border-slate-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showSecret ? 'Hide secret key' : 'Show secret key'}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {config.provider === 'none' && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-800">
                  No CAPTCHA provider is selected. Forms will be unprotected from automated
                  submissions.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function LeadSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Form &amp; Lead Notification Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage notification emails, auto-reply templates, form fields, and spam protection.
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="notifications" className="text-sm">
            <Mail className="mr-2 h-4 w-4" />
            Notification Emails
          </TabsTrigger>
          <TabsTrigger value="auto-reply" className="text-sm">
            <Bot className="mr-2 h-4 w-4" />
            Auto-Reply Templates
          </TabsTrigger>
          <TabsTrigger value="form-config" className="text-sm">
            <FileText className="mr-2 h-4 w-4" />
            Form Configuration
          </TabsTrigger>
          <TabsTrigger value="captcha" className="text-sm">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Spam Protection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationTab />
        </TabsContent>
        <TabsContent value="auto-reply">
          <AutoReplyTab />
        </TabsContent>
        <TabsContent value="form-config">
          <FormConfigTab />
        </TabsContent>
        <TabsContent value="captcha">
          <CaptchaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
