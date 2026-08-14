'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DataTable, PublishedBadge, type ColumnDef } from '../_components/DataTable';
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

// ─── Types ────────────────────────────────────────────────────────────────

type TeamMember = {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

// ─── Animation ────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Columns ─────────────────────────────────────────────────────────────

const columns: ColumnDef<TeamMember>[] = [
  {
    key: 'photoUrl',
    label: 'Photo',
    className: 'w-14',
    render: (tm) => (
      <div
        className="h-10 w-10 rounded-full bg-cover bg-center bg-no-repeat ring-1 ring-slate-200"
        style={{
          backgroundImage: tm.photoUrl ? `url(${tm.photoUrl})` : undefined,
        }}
      />
    ),
  },
  {
    key: 'name',
    label: 'Name',
    render: (tm) => (
      <div>
        <p className="font-medium text-slate-900 text-sm">{tm.name}</p>
        {tm.title && <p className="text-xs text-slate-400 mt-0.5">{tm.title}</p>}
      </div>
    ),
  },
  {
    key: 'isPublished',
    label: 'Status',
    className: 'w-28',
    render: (tm) => <PublishedBadge published={tm.isPublished} />,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function TeamListPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/team-members');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMembers(data);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/team-members/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchMembers();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (reordered: TeamMember[]) => {
    await fetch('/api/team-members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((m, idx) => ({ id: m.id, order: idx })),
      }),
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your team members and their display order.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<TeamMember>
          columns={columns}
          data={members}
          isLoading={loading}
          emptyMessage="No team members yet. Add your first team member."
          newHref="/admin/team/new"
          newLabel="New Member"
          editable
          editHref={(tm) => `/admin/team/${tm.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          draggable
          onReorder={handleReorder}
          title={`${members.length} ${members.length === 1 ? 'member' : 'members'}`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
