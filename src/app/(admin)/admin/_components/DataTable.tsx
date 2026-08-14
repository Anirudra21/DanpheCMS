'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, GripVertical, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cms-utils';
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

// ─── Types ────────────────────────────────────────────────────────────────

export type ColumnDef<T> = {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
};

export type ActionDef<T> = {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void | Promise<void>;
  variant?: 'default' | 'destructive';
  show?: (item: T) => boolean;
};

interface DataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  newHref?: string;
  newLabel?: string;
  editable?: boolean;
  editHref?: (item: T) => string;
  deletable?: boolean;
  onDelete?: (item: T) => void | Promise<void>;
  draggable?: boolean;
  onReorder?: (items: T[]) => void | Promise<void>;
  actions?: ActionDef<T>[];
  title?: string;
}

// ─── Sortable Row ─────────────────────────────────────────────────────────

function SortableRow<T extends { id: string; order?: number }>({
  item,
  columns,
  rowIndex,
  editHref,
  editable,
  deletable,
  onDelete,
  actions,
}: {
  item: T;
  columns: ColumnDef<T>[];
  rowIndex: number;
  editHref?: (item: T) => string;
  editable?: boolean;
  deletable?: boolean;
  onDelete?: (item: T) => void | Promise<void>;
  actions?: ActionDef<T>[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        'group',
        isDragging && 'bg-white shadow-lg ring-1 ring-slate-200 rounded-lg',
      )}
    >
      {columns.map((col) => (
        <TableCell key={col.key} className={col.className}>
          {col.render
            ? col.render(item)
            : (item[col.key as keyof T] as React.ReactNode) ?? '—'}
        </TableCell>
      ))}
      {(editable || deletable || (actions && actions.length > 0)) && (
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {editable && editHref && (
              <Link href={editHref(item)}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
            {actions?.map((action, idx) => {
              const show = action.show ? action.show(item) : true;
              if (!show) return null;
              return (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0',
                    action.variant === 'destructive'
                      ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                      : 'text-slate-400 hover:text-slate-700',
                  )}
                  onClick={() => action.onClick(item)}
                >
                  {action.icon || action.label}
                </Button>
              );
            })}
            {deletable && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export function DataTable<T extends { id: string; order?: number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No items found.',
  newHref,
  newLabel = 'New',
  editable = true,
  editHref,
  deletable = true,
  onDelete,
  draggable = false,
  onReorder,
  actions,
  title,
}: DataTableProps<T>) {
  const [items, setItems] = useState(data);
  const [reordering, setReordering] = useState(false);

  // Sync external data
  if (data !== items && !reordering) {
    setItems(data);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const hasActions = editable || deletable || (actions && actions.length > 0);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex)
        .map((item, idx) => ({ ...item, order: idx }));

      setReordering(true);
      setItems(reordered);

      if (onReorder) {
        try {
          await onReorder(reordered);
        } catch {
          setItems(data);
        }
      }
      setReordering(false);
    },
    [items, data, onReorder],
  );

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        {(title || newHref) && (
          <div className="flex items-center justify-between">
            {title && <Skeleton className="h-6 w-32" />}
            {newHref && <Skeleton className="h-9 w-24" />}
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/80">
                {draggable && <TableHead className="w-10" />}
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
                {hasActions && <TableHead className="w-24 text-right" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {draggable && <TableCell className="w-10"><Skeleton className="h-4 w-4" /></TableCell>}
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-5 w-3/4" />
                    </TableCell>
                  ))}
                  {hasActions && <TableCell className="w-24"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with New button */}
      {(title || newHref) && (
        <div className="flex items-center justify-between">
          {title && (
            <h2 className="text-sm font-medium text-slate-500">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </h2>
          )}
          {newHref && (
            <Link href={newHref}>
              <Button size="sm" className="h-8 gap-1.5 text-xs font-medium">
                <Plus className="h-3.5 w-3.5" />
                {newLabel}
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white">
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm">{emptyMessage}</p>
            {newHref && (
              <Link href={newHref} className="mt-3">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  {newLabel}
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Table */
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-50/80">
                    {draggable && (
                      <TableHead className="w-10" />
                    )}
                    {columns.map((col) => (
                      <TableHead key={col.key} className={col.className}>
                        {col.label}
                      </TableHead>
                    ))}
                    {hasActions && (
                      <TableHead className="w-24 text-right" />
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      columns={columns}
                      rowIndex={idx}
                      editHref={editHref}
                      editable={editable}
                      deletable={deletable}
                      onDelete={onDelete}
                      actions={actions}
                    />
                  ))}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

// ─── Helper: Published Badge ───────────────────────────────────────────────

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'text-[11px] font-medium border-0',
        published
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500',
      )}
    >
      {published ? 'Published' : 'Draft'}
    </Badge>
  );
}
