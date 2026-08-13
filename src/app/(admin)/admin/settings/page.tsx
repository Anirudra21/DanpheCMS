'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cms-utils';

interface SettingItem {
  key: string;
  value: string;
  label: string;
  group: string;
  type: string;
}

const GROUPS = [
  { key: 'general', label: 'General' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'contact', label: 'Contact' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(Array.isArray(data) ? data : data.settings ?? []);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const updateValue = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings.map((s) => ({ key: s.key, value: s.value }))),
      });
      if (res.ok) {
        toast({ title: 'Settings saved' });
      } else {
        toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getGroupSettings = (group: string) => settings.filter((s) => s.group === group);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-3xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-danphe-text">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your site configuration</p>
        </div>
        <Button
          className="bg-danphe-accent hover:bg-danphe-accent-light text-white"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-danphe-border/60">
              <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10" /></div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {GROUPS.map((group, idx) => {
            const items = getGroupSettings(group.key);
            if (items.length === 0) return null;
            return (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-danphe-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">{group.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {items.map((setting, sIdx) => (
                      <div key={setting.key}>
                        {sIdx > 0 && <Separator className="mb-5" />}
                        <div className="space-y-2">
                          <Label htmlFor={setting.key}>{setting.label}</Label>
                          {setting.type === 'TEXT' ? (
                            <Textarea
                              id={setting.key}
                              value={setting.value}
                              onChange={(e) => updateValue(setting.key, e.target.value)}
                              rows={3}
                              className="border-danphe-border resize-none"
                            />
                          ) : (
                            <Input
                              id={setting.key}
                              value={setting.value}
                              onChange={(e) => updateValue(setting.key, e.target.value)}
                              className="border-danphe-border"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {settings.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No settings configured yet.</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}