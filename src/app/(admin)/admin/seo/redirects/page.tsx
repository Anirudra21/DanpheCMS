'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ArrowRightLeft,
  FileSearch,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─── Animation Variants ──────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Types ───────────────────────────────────────────────────────────────

type RedirectRule = {
  id: string;
  fromPath: string;
  toPath: string;
  type: 'PERMANENT_301' | 'TEMPORARY_302';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type DialogMode = 'add' | 'edit';

const emptyForm = {
  fromPath: '',
  toPath: '',
  type: 'PERMANENT_301' as const,
};

// ─── Page Component ──────────────────────────────────────────────────────

export default function RedirectsPage() {
  const [loading, setLoading] = useState(true);
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('add');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RedirectRule | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch redirects ──
  const fetchRedirects = useCallback(async () => {
    try {
      const res = await fetch('/api/seo/redirects');
      if (!res.ok) throw new Error('Failed to load redirects');
      const data = await res.json();
      setRedirects(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load redirects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRedirects();
  }, [fetchRedirects]);

  // ── Open add dialog ──
  const openAdd = () => {
    setDialogMode('add');
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  // ── Open edit dialog ──
  const openEdit = (rule: RedirectRule) => {
    setDialogMode('edit');
    setEditId(rule.id);
    setForm({
      fromPath: rule.fromPath,
      toPath: rule.toPath,
      type: rule.type,
    });
    setDialogOpen(true);
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.fromPath.trim() || !form.toPath.trim()) {
      toast.error('Both From Path and To Path are required');
      return;
    }

    setSaving(true);
    try {
      const isEdit = dialogMode === 'edit' && editId;
      const url = isEdit ? `/api/seo/redirects/${editId}` : '/api/seo/redirects';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save redirect');
      }

      toast.success(isEdit ? 'Redirect updated successfully' : 'Redirect created successfully');
      setDialogOpen(false);
      fetchRedirects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save redirect');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle enabled ──
  const toggleEnabled = async (rule: RedirectRule) => {
    try {
      const res = await fetch(`/api/seo/redirects/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !rule.enabled }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      fetchRedirects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle redirect');
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/seo/redirects/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Redirect deleted successfully');
      setDeleteTarget(null);
      fetchRedirects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete redirect');
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = 'h-9 text-sm focus:ring-2 focus:ring-danphe-accent/30 focus:border-danphe-accent/50';

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ── Page Header ── */}
      <motion.div variants={item} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Redirects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage URL redirect rules for SEO and site migrations.
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-danphe-accent hover:bg-danphe-accent/90 text-white h-9 gap-2 text-sm font-medium shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Redirect
        </Button>
      </motion.div>

      {/* ── Table ── */}
      <motion.div variants={item}>
        {redirects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <ArrowRightLeft className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No redirect rules yet</p>
            <p className="text-xs text-slate-400 mt-1">Add a redirect rule to manage URL changes.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">From Path</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">To Path</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Enabled</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {redirects.map((rule) => (
                    <tr key={rule.id} className={`hover:bg-slate-50/50 transition-colors ${!rule.enabled ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-700 max-w-[200px] truncate">
                        {rule.fromPath}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500 max-w-[200px] truncate">
                        {rule.toPath}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={
                            rule.type === 'PERMANENT_301'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {rule.type === 'PERMANENT_301' ? '301' : '302'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleEnabled(rule)}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            onClick={() => openEdit(rule)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                            onClick={() => setDeleteTarget(rule)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Add/Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add Redirect' : 'Edit Redirect'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add'
                ? 'Create a new URL redirect rule.'
                : 'Update this redirect rule.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="redirect-from" className="text-sm font-medium text-slate-700">From Path</Label>
              <Input
                id="redirect-from"
                value={form.fromPath}
                onChange={(e) => setForm((p) => ({ ...p, fromPath: e.target.value }))}
                placeholder="/old-page"
                className={`${inputCls} font-mono`}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="redirect-to" className="text-sm font-medium text-slate-700">To Path</Label>
              <Input
                id="redirect-to"
                value={form.toPath}
                onChange={(e) => setForm((p) => ({ ...p, toPath: e.target.value }))}
                placeholder="/new-page"
                className={`${inputCls} font-mono`}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Redirect Type</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: 'PERMANENT_301' }))}
                  className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                    form.type === 'PERMANENT_301'
                      ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">301 Permanent</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Search engines transfer SEO value to the new URL.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: 'TEMPORARY_302' }))}
                  className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                    form.type === 'TEMPORARY_302'
                      ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">302 Temporary</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Search engines keep the original URL indexed.</p>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-sm">
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={handleSave}
              className="bg-danphe-accent hover:bg-danphe-accent/90 text-white text-sm gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : dialogMode === 'add' ? (
                'Create Redirect'
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Redirect</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the redirect from{' '}
              <span className="font-mono font-semibold">{deleteTarget?.fromPath}</span>{' '}
              to <span className="font-mono font-semibold">{deleteTarget?.toPath}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
