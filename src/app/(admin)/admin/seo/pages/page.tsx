'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Pencil,
  Search,
  AlertCircle,
  FileSearch,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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

type SeoPageMeta = {
  id: string;
  pageType: string;
  pageSlug: string;
  pageTitle: string;
  metaTitle: string;
  metaDesc: string;
  canonicalUrl: string;
  ogImageUrl: string;
  createdAt: string;
  updatedAt: string;
};

type FilterTab = 'ALL' | 'HOMEPAGE' | 'SOLUTION' | 'POST' | 'JOB' | 'PAGE';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'HOMEPAGE', label: 'Homepage' },
  { value: 'SOLUTION', label: 'Solutions' },
  { value: 'POST', label: 'Posts' },
  { value: 'JOB', label: 'Jobs' },
];

const PAGE_TYPE_COLORS: Record<string, string> = {
  HOMEPAGE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SOLUTION: 'bg-sky-50 text-sky-700 border-sky-200',
  POST: 'bg-violet-50 text-violet-700 border-violet-200',
  JOB: 'bg-amber-50 text-amber-700 border-amber-200',
  PAGE: 'bg-slate-50 text-slate-700 border-slate-200',
};

// ─── Page Component ──────────────────────────────────────────────────────

export default function SeoPagesPage() {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<SeoPageMeta[]>([]);
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [editItem, setEditItem] = useState<SeoPageMeta | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    metaTitle: '',
    metaDesc: '',
    canonicalUrl: '',
    ogImageUrl: '',
  });

  // ── Fetch pages ──
  const fetchPages = useCallback(async () => {
    try {
      const params = filter !== 'ALL' ? `?pageType=${filter}` : '';
      const res = await fetch(`/api/seo/pages${params}`);
      if (!res.ok) throw new Error('Failed to load pages');
      const data = await res.json();
      setPages(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load SEO pages');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchPages();
  }, [fetchPages]);

  // ── Open edit dialog ──
  const openEdit = (page: SeoPageMeta) => {
    setEditItem(page);
    setEditForm({
      metaTitle: page.metaTitle,
      metaDesc: page.metaDesc,
      canonicalUrl: page.canonicalUrl,
      ogImageUrl: page.ogImageUrl,
    });
  };

  // ── Save edit ──
  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/seo/pages/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }
      toast.success('SEO meta updated successfully');
      setEditItem(null);
      fetchPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
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
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Per-Page SEO</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage meta titles, descriptions, and canonical URLs for individual pages.
        </p>
      </motion.div>

      {/* ── Filter Tabs ── */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-danphe-accent text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── Table ── */}
      <motion.div variants={item}>
        {pages.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <FileSearch className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No SEO entries found</p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'ALL'
                ? 'Page SEO entries are created automatically when content is published.'
                : `No ${filter.toLowerCase()} pages with SEO metadata yet.`}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Page Title</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">URL Path</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Meta Title</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900 max-w-[200px] truncate">
                        {page.pageTitle || page.pageSlug || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={PAGE_TYPE_COLORS[page.pageType] || 'bg-slate-50 text-slate-700 border-slate-200'}
                        >
                          {page.pageType}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-mono text-xs max-w-[180px] truncate">
                        /{page.pageSlug || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 max-w-[200px] truncate">
                        {page.metaTitle || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-slate-600 hover:text-slate-900"
                          onClick={() => openEdit(page)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit SEO Meta</DialogTitle>
            <DialogDescription>
              Update meta information for &ldquo;{editItem?.pageTitle || editItem?.pageSlug || 'this page'}&rdquo;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-metaTitle" className="text-sm font-medium text-slate-700">Meta Title</Label>
              <Input
                id="edit-metaTitle"
                value={editForm.metaTitle}
                onChange={(e) => setEditForm((p) => ({ ...p, metaTitle: e.target.value }))}
                placeholder="Custom meta title…"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-metaDesc" className="text-sm font-medium text-slate-700">Meta Description</Label>
              <Textarea
                id="edit-metaDesc"
                value={editForm.metaDesc}
                onChange={(e) => setEditForm((p) => ({ ...p, metaDesc: e.target.value }))}
                placeholder="A compelling description for search results…"
                rows={3}
                className="text-sm resize-y focus:ring-2 focus:ring-danphe-accent/30 focus:border-danphe-accent/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-canonicalUrl" className="text-sm font-medium text-slate-700">Canonical URL</Label>
              <Input
                id="edit-canonicalUrl"
                type="url"
                value={editForm.canonicalUrl}
                onChange={(e) => setEditForm((p) => ({ ...p, canonicalUrl: e.target.value }))}
                placeholder="https://danphehealth.com/…"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-ogImageUrl" className="text-sm font-medium text-slate-700">OG Image Override URL</Label>
              <Input
                id="edit-ogImageUrl"
                type="url"
                value={editForm.ogImageUrl}
                onChange={(e) => setEditForm((p) => ({ ...p, ogImageUrl: e.target.value }))}
                placeholder="https://danphehealth.com/og-page.jpg"
                className={inputCls}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditItem(null)}
              className="text-sm"
            >
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
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
