'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/cms-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { ImageUpload } from '../_components/ImageUpload';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// -─ Types --------------------------------

type Section = {
  id: string;
  key: string;
  heading: string;
  subheading: string;
  body: string;
  image: string;
  ctaLabel: string;
  ctaUrl: string;
  order: number;
};

type SectionDraft = Omit<Section, 'id' | 'key' | 'order'>;

// -─ Key Labels -----------------------------─

const keyLabels: Record<string, string> = {
  hero: 'Hero',
  value_adds: 'Value Adds',
  solutions_intro: 'Solutions Intro',
  features_row: 'Features Row',
  testimonial_intro: 'Testimonial Intro',
  newsletter_cta: 'Newsletter CTA',
};

const keyDescriptions: Record<string, string> = {
  hero: 'Main banner with headline, tagline, and primary CTA button.',
  value_adds: 'Value proposition section with bullet points and side image.',
  solutions_intro: 'Introduction to the solutions/module explorer section.',
  features_row: 'Feature highlight cards explaining key differentiators.',
  testimonial_intro: 'Client testimonial carousel heading and setup.',
  newsletter_cta: 'Bottom call-to-action with newsletter subscription form.',
};

const keyColors: Record<string, string> = {
  hero: 'bg-blue-100 text-blue-700',
  value_adds: 'bg-emerald-100 text-emerald-700',
  solutions_intro: 'bg-violet-100 text-violet-700',
  features_row: 'bg-amber-100 text-amber-700',
  testimonial_intro: 'bg-rose-100 text-rose-700',
  newsletter_cta: 'bg-teal-100 text-teal-700',
};

// -─ Animation ------------------------------

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// -─ Sortable Section Card ------------------------

function SortableSectionCard({
  section,
  expanded,
  onToggle,
  onSave,
  savingId,
}: {
  section: Section;
  expanded: boolean;
  onToggle: () => void;
  onSave: (id: string, data: SectionDraft) => Promise<void>;
  savingId: string | null;
}) {
  const [draft, setDraft] = useState<SectionDraft>(() => ({
    heading: section.heading,
    subheading: section.subheading,
    body: section.body,
    image: section.image,
    ctaLabel: section.ctaLabel,
    ctaUrl: section.ctaUrl,
  }));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const isSaving = savingId === section.id;
  const label = keyLabels[section.key] ?? section.key;
  const desc = keyDescriptions[section.key] ?? '';
  const color = keyColors[section.key] ?? 'bg-slate-100 text-slate-700';

  const update = useCallback(
    (field: keyof SectionDraft, value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
      setDirty(true);
      setError('');
    },
    [],
  );

  const handleSave = async () => {
 setError('');
    try {
      await onSave(section.id, draft);
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border bg-white transition-shadow',
        isDragging
          ? 'shadow-lg ring-2 ring-danphe-accent/30 border-danphe-accent/40'
          : expanded
            ? 'border-slate-300 shadow-sm'
            : 'border-slate-200 hover:border-slate-300',
      )}
    >
      <button
        type="button"
        className="flex items-center gap-3 w-full px-4 py-3.5 text-left cursor-pointer"
        onClick={onToggle}
      >
        {/* Drag handle */}
        <div
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors touch-none"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Order badge */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
          {section.order + 1}
        </span>

        {/* Key badge */}
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold',
            color,
          )}
        >
          {label}
        </span>

        {/* Key identifier */}
        <span className="text-xs text-slate-400 font-mono">{section.key}</span>

        {/* Heading preview */}
        <span className="flex-1 text-sm text-slate-700 font-medium truncate">
          {section.heading || <span className="italic text-slate-300">No heading</span>}
        </span>

        {/* Dirty indicator */}
        {dirty && (
          <span className="flex h-2 w-2 rounded-full bg-amber-400" title="Unsaved changes" />
        )}

        {/* Expand/collapse */}
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 pb-5 pt-4 space-y-5">
              {/* Description */}
              {desc && (
                <p className="text-xs text-slate-400 -mt-1">{desc}</p>
              )}

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Heading */}
              <div className="space-y-1.5">
                <Label htmlFor={`heading-${section.id}`} className="text-sm font-medium text-slate-700">
                  Heading
                </Label>
                <Input
                  id={`heading-${section.id}`}
                  value={draft.heading}
                  onChange={(e) => update('heading', e.target.value)}
                  placeholder="Section heading"
                  className="h-9 text-sm"
                />
              </div>

              {/* Subheading */}
              <div className="space-y-1.5">
                <Label htmlFor={`subheading-${section.id}`} className="text-sm font-medium text-slate-700">
                  Subheading
                </Label>
                <Input
                  id={`subheading-${section.id}`}
                  value={draft.subheading}
                  onChange={(e) => update('subheading', e.target.value)}
                  placeholder="Section subheading or tagline"
                  className="h-9 text-sm"
                />
              </div>

              {/* Body (rich text) */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  Body Content
                </Label>
                <RichTextEditor
                  content={draft.body}
                  onChange={(html) => update('body', html)}
                  placeholder="Rich text content for this section…"
                />
              </div>

              {/* Image upload */}
              <ImageUpload
                value={draft.image}
                onChange={(url) => update('image', url)}
                folder="homepage"
                label="Section Image"
              />

              {/* CTA row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`cta-${section.id}`} className="text-sm font-medium text-slate-700">
                    CTA Label
                  </Label>
                  <Input
                    id={`cta-${section.id}`}
                    value={draft.ctaLabel}
                    onChange={(e) => update('ctaLabel', e.target.value)}
                    placeholder='e.g. "Schedule a Demo"'
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`cta-url-${section.id}`} className="text-sm font-medium text-slate-700">
                    CTA URL
                  </Label>
                  <Input
                    id={`cta-url-${section.id}`}
                    value={draft.ctaUrl}
                    onChange={(e) => update('ctaUrl', e.target.value)}
                    placeholder="/schedule-a-demo"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-medium"
                  disabled={!dirty || isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
                {dirty && !isSaving && (
                  <span className="text-xs text-amber-600">Unsaved changes</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -─ Main Page ------------------------------

export default function HomepageEditorPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch('/api/homepage-sections');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSections(data);
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
        ...s,
        order: idx,
      }));

      setReordering(true);
      setSections(reordered);

      try {
        await fetch('/api/homepage-sections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: reordered.map((s) => ({ id: s.id, order: s.order })) }),
        });
      } catch {
        // revert
        setSections(sections);
      }
      setReordering(false);
    },
    [sections],
  );

  const handleSave = useCallback(
    async (id: string, data: SectionDraft) => {
      setSavingId(id);
      const res = await fetch(`/api/homepage-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }
      // Refresh to get latest
      const updated = await (await fetch('/api/homepage-sections')).json();
      setSections(updated);
      setSavingId(null);
    },
    [],
  );

  // - Loading -
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Homepage</h1>
        <p className="text-sm text-slate-500 mt-1">
          Edit the sections that appear on the homepage. Drag to reorder, click to expand and edit.
        </p>
      </motion.div>

      {/* Section list with drag reorder */}
      <motion.div variants={item}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableSectionCard
                  key={`${section.id}-${section.order}`}
                  section={section}
                  expanded={expandedId === section.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === section.id ? null : section.id))
                  }
                  onSave={handleSave}
                  savingId={savingId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </motion.div>

      {/* Empty state */}
      {sections.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          <p className="text-sm">No homepage sections found.</p>
          <p className="text-xs mt-1">Run the seed script to create default sections.</p>
        </div>
      )}
    </motion.div>
  );
}
