'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/cms-utils';
import {
  getAllPermissions,
  getPermissionsForRole,
  type AdminRole,
  type PermissionDef,
  type PermissionGroup,
} from '@/lib/admin-auth';

// ─── Types ──────────────────────────────────────────────────────────────────

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface RoleInfo {
  key: AdminRole;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ROLES: RoleInfo[] = [
  {
    key: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Full access to all system features, user management, and security settings.',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  {
    key: 'EDITOR',
    label: 'Editor',
    description: 'Can edit content, media, navigation, and most site settings. Cannot manage users.',
    color: 'text-danphe-accent',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    key: 'CONTENT_MANAGER',
    label: 'Content Manager',
    description: 'Manages content pages, solutions, team, media, and SEO. Limited site settings.',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    key: 'SUPPORT',
    label: 'Support',
    description: 'Read-only access to dashboard, leads, and posts. For support staff viewing data.',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
];

const GROUP_LABELS: Record<PermissionGroup, string> = {
  general: 'General',
  content: 'Content',
  engage: 'Engage',
  seo: 'SEO',
  appearance: 'Appearance',
  admin: 'Admin',
};

const GROUP_ORDER: PermissionGroup[] = ['general', 'content', 'engage', 'seo', 'appearance', 'admin'];

// ─── Component ──────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const allPermissions = useMemo(() => getAllPermissions(), []);

  // Group permissions by group
  const groupedPermissions = useMemo(() => {
    const map = new Map<PermissionGroup, PermissionDef[]>();
    for (const g of GROUP_ORDER) {
      map.set(g, []);
    }
    for (const p of allPermissions) {
      const arr = map.get(p.group);
      if (arr) arr.push(p);
    }
    return map;
  }, [allPermissions]);

  // Pre-compute role permission sets
  const rolePermissionSets = useMemo(() => {
    const sets: Record<AdminRole, Set<string>> = {
      SUPER_ADMIN: new Set(getPermissionsForRole('SUPER_ADMIN')),
      EDITOR: new Set(getPermissionsForRole('EDITOR')),
      CONTENT_MANAGER: new Set(getPermissionsForRole('CONTENT_MANAGER')),
      SUPPORT: new Set(getPermissionsForRole('SUPPORT')),
    };
    return sets;
  }, []);

  // Users grouped by role
  const usersByRole = useMemo(() => {
    const map: Record<string, UserRecord[]> = {
      SUPER_ADMIN: [],
      EDITOR: [],
      CONTENT_MANAGER: [],
      SUPPORT: [],
    };
    for (const u of users) {
      if (map[u.role]) {
        map[u.role].push(u);
      }
    }
    return map;
  }, [users]);

  function renderCell(roleKey: AdminRole, permKey: string) {
    const has = rolePermissionSets[roleKey].has(permKey);
    if (has) {
      return (
        <div className="flex justify-center">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100">
            <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-center">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100">
          <X className="h-3.5 w-3.5 text-slate-400" strokeWidth={3} />
        </div>
      </div>
    );
  }

  // Count permissions per role
  function countPermissions(roleKey: AdminRole): number {
    return rolePermissionSets[roleKey].size;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage access levels and permission groups for your team.
        </p>
      </div>

      {/* Permission Matrix Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-danphe-accent" />
            <h2 className="text-lg font-semibold text-slate-900">Permission Matrix</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Overview of all permissions across roles.
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50">
                <TableHead className="w-52 text-slate-600 font-semibold">Permission</TableHead>
                {ROLES.map((r) => (
                  <TableHead
                    key={r.key}
                    className="text-center text-slate-600 font-semibold min-w-[120px]"
                  >
                    {r.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {GROUP_ORDER.map((group) => {
                const perms = groupedPermissions.get(group);
                if (!perms || perms.length === 0) return null;
                return (
                  <>
                    {/* Group header row */}
                    <TableRow key={`group-${group}`} className="hover:bg-transparent">
                      <TableCell
                        colSpan={5}
                        className="pt-5 pb-1 px-4"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {GROUP_LABELS[group]}
                        </span>
                      </TableCell>
                    </TableRow>
                    {/* Permission rows */}
                    {perms.map((perm) => (
                      <TableRow
                        key={perm.key}
                        className="group hover:bg-slate-50/50"
                      >
                        <TableCell className="text-sm text-slate-700 font-medium">
                          {perm.label}
                        </TableCell>
                        {ROLES.map((r) => (
                          <TableCell key={`${perm.key}-${r.key}`} className="text-center">
                            {renderCell(r.key, perm.key)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Role Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {ROLES.map((role, idx) => {
            const roleUsers = usersByRole[role.key] ?? [];
            return (
              <motion.div
                key={role.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={cn(
                  'rounded-xl border bg-white p-5',
                  role.borderColor
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={cn('text-sm font-bold', role.color)}>
                      {role.label}
                    </h3>
                    <Badge variant="secondary" className="mt-1.5 text-xs">
                      {countPermissions(role.key)} permissions
                    </Badge>
                  </div>
                  <Shield className={cn('h-5 w-5', role.color)} />
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {role.description}
                </p>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Users ({roleUsers.length})
                  </p>
                  {loading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                    </div>
                  ) : roleUsers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No users assigned</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5">
                      {roleUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className={cn(
                              'h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0',
                              role.key === 'SUPER_ADMIN'
                                ? 'bg-rose-500'
                                : role.key === 'EDITOR'
                                  ? 'bg-danphe-accent'
                                  : role.key === 'CONTENT_MANAGER'
                                    ? 'bg-amber-500'
                                    : 'bg-slate-500'
                            )}
                          >
                            {u.name
                              ? u.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()
                              : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-700 truncate">
                              {u.name || 'Unnamed'}
                            </p>
                            <p className="text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
