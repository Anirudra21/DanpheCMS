'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable, type ColumnDef } from '../_components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import { cn, formatDate } from '@/lib/cms-utils';
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

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
  createdAt: string;
  updatedAt: string;
};

type NewUserForm = {
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
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

const columns: ColumnDef<AdminUser>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (user) => (
      <span className="font-medium text-slate-900 text-sm">{user.name || '—'}</span>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    render: (user) => (
      <span className="text-sm text-slate-600">{user.email}</span>
    ),
  },
  {
    key: 'role',
    label: 'Role',
    className: 'w-32',
    render: (user) => (
      <Badge
        variant="secondary"
        className={cn(
          'text-[11px] font-medium border-0',
          user.role === 'SUPER_ADMIN'
            ? 'bg-violet-100 text-violet-700'
            : 'bg-slate-100 text-slate-600',
        )}
      >
        {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Editor'}
      </Badge>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created Date',
    className: 'w-36',
    render: (user) => (
      <span className="text-sm text-slate-500">{formatDate(user.createdAt)}</span>
    ),
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function UsersListPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [newUser, setNewUser] = useState<NewUserForm>({
    name: '',
    email: '',
    password: '',
    role: 'EDITOR',
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUser.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!newUser.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!newUser.password || newUser.password.trim().length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }
      setNewUser({ name: '', email: '', password: '', role: 'EDITOR' });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage admin user accounts and roles.
        </p>
      </motion.div>

      {/* Add New User - Collapsible Card */}
      <motion.div variants={item}>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Add New User</span>
            </div>
            {showAddForm
              ? <ChevronUp className="h-4 w-4 text-slate-400" />
              : <ChevronDown className="h-4 w-4 text-slate-400" />
            }
          </button>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-slate-100 px-5 py-5">
                  {formError && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="new-name" className="text-sm font-medium text-slate-700">
                          Name <span className="ml-0.5 text-red-400">*</span>
                        </Label>
                        <Input
                          id="new-name"
                          type="text"
                          placeholder="e.g. John Doe"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="new-email" className="text-sm font-medium text-slate-700">
                          Email <span className="ml-0.5 text-red-400">*</span>
                        </Label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="e.g. john@example.com"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="new-password" className="text-sm font-medium text-slate-700">
                          Password <span className="ml-0.5 text-red-400">*</span>
                        </Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Min 8 characters"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(v) => setNewUser({ ...newUser, role: v as 'SUPER_ADMIN' | 'EDITOR' })}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="EDITOR">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <Button
                        type="submit"
                        disabled={creating}
                        className="h-9 gap-2 text-sm font-medium"
                      >
                        {creating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating…
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Create User
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 text-sm"
                        onClick={() => {
                          setShowAddForm(false);
                          setFormError('');
                          setNewUser({ name: '', email: '', password: '', role: 'EDITOR' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={item}>
        <DataTable<AdminUser>
          columns={columns}
          data={users}
          isLoading={loading}
          emptyMessage="No users yet. Add your first admin user."
          editable
          editHref={(user) => `/admin/users/${user.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          title={`${users.length} ${users.length === 1 ? 'user' : 'users'}`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.name || deleteTarget?.email}&rdquo;</strong>?
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
