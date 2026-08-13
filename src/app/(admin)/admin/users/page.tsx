'use client';

import { useEffect, useState } from 'react';
import { Plus, Shield, ShieldCheck, ShieldAlert, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DataTable, type Column } from '@/components/cms/DataTable';
import { cn, formatDate, getInitials, getAvatarColor } from '@/lib/cms-utils';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  image?: string | null;
}

const roleIcon = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN': return <ShieldAlert className="h-3.5 w-3.5" />;
    case 'ADMIN': return <ShieldCheck className="h-3.5 w-3.5" />;
    case 'EDITOR': return <Shield className="h-3.5 w-3.5" />;
    default: return <Eye className="h-3.5 w-3.5" />;
  }
};

const roleColor = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN': return 'bg-red-100 text-red-700';
    case 'ADMIN': return 'bg-danphe-accent/10 text-danphe-accent';
    case 'EDITOR': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('VIEWER');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, email: formEmail, password: formPassword, role: formRole }),
      });
      if (res.ok) {
        toast({ title: 'User created' });
        setDialogOpen(false);
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormRole('VIEWER');
        fetchUsers();
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.error ?? 'Failed to create user.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<UserItem>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white', getAvatarColor(user.name))}>
            {user.image ? (
              <img src={user.image} alt={user.name} className="h-full w-full rounded-full object-cover" />
            ) : getInitials(user.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-danphe-text">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <Badge variant="secondary" className={cn('text-xs gap-1', roleColor(user.role))}>
          {roleIcon(user.role)}
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (user) => (
        <Badge variant={user.isActive ? 'default' : 'secondary'} className={cn('text-xs', user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-danphe-text">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage user accounts and roles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-danphe-accent hover:bg-danphe-accent-light text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account for the CMS.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="user-name">Name</Label>
                <Input
                  id="user-name"
                  placeholder="Full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="border-danphe-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="border-danphe-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Password</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="border-danphe-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formRole} onValueChange={setFormRole}>
                  <SelectTrigger className="border-danphe-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-danphe-border">
                Cancel
              </Button>
              <Button
                className="bg-danphe-accent hover:bg-danphe-accent-light text-white"
                onClick={handleAddUser}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={loading}
        emptyMessage="No users found."
      />
    </motion.div>
  );
}