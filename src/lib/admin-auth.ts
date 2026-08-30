import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export type AdminRole = 'SUPER_ADMIN' | 'EDITOR' | 'CONTENT_MANAGER' | 'SUPPORT';

interface JwtPayload {
  id: string;
  role: AdminRole;
  name?: string;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    return { id: payload.id, role: payload.role, name: payload.name };
  } catch {
    return null;
  }
}

export function getSession(request: NextRequest) {
  return getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
}

export function decodeAdminToken(request: NextRequest): JwtPayload | null {
  const token = getSession(request);
  if (!token) return null;
  return decodeToken(token as string);
}

/**
 * Require SUPER_ADMIN role. Returns 403 if not authorized.
 */
export function requireSuperAdmin(request: NextRequest) {
  const token = getSession(request);
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const payload = decodeToken(token as string);
  if (!payload || payload.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Insufficient permissions. SUPER_ADMIN required.' },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Require any authenticated admin.
 * Returns 401 if not authenticated.
 */
export function requireAdmin(request: NextRequest) {
  const token = getSession(request);
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return null;
}

// ─── Permission System ──────────────────────────────────────────────────

type PermissionGroup = 'general' | 'content' | 'engage' | 'seo' | 'appearance' | 'admin';

interface PermissionDef {
  key: string;
  label: string;
  group: PermissionGroup;
}

export const ALL_PERMISSIONS: PermissionDef[] = [
  // General
  { key: 'dashboard.view', label: 'View Dashboard', group: 'general' },
  { key: 'settings.view', label: 'View Site Settings', group: 'general' },
  { key: 'settings.edit', label: 'Edit Site Settings', group: 'general' },
  { key: 'navigation.view', label: 'View Navigation', group: 'general' },
  { key: 'navigation.edit', label: 'Edit Navigation', group: 'general' },
  { key: 'maintenance.view', label: 'View Maintenance', group: 'general' },
  { key: 'maintenance.edit', label: 'Edit Maintenance', group: 'general' },
  { key: 'analytics.view', label: 'View Analytics', group: 'general' },
  { key: 'analytics.edit', label: 'Edit Analytics', group: 'general' },
  // Content
  { key: 'homepage.view', label: 'View Homepage', group: 'content' },
  { key: 'homepage.edit', label: 'Edit Homepage', group: 'content' },
  { key: 'solutions.view', label: 'View Solutions', group: 'content' },
  { key: 'solutions.edit', label: 'Edit Solutions', group: 'content' },
  { key: 'team.view', label: 'View Team', group: 'content' },
  { key: 'team.edit', label: 'Edit Team', group: 'content' },
  { key: 'media.view', label: 'View Media Library', group: 'content' },
  { key: 'media.upload', label: 'Upload Media', group: 'content' },
  { key: 'media.delete', label: 'Delete Media', group: 'content' },
  // Engage
  { key: 'posts.view', label: 'View Posts', group: 'engage' },
  { key: 'posts.edit', label: 'Edit Posts', group: 'engage' },
  { key: 'leads.view', label: 'View Leads', group: 'engage' },
  { key: 'leads.settings', label: 'Lead Settings', group: 'engage' },
  // SEO & Growth
  { key: 'seo.view', label: 'View SEO Settings', group: 'seo' },
  { key: 'seo.edit', label: 'Edit SEO Settings', group: 'seo' },
  // Appearance
  { key: 'themes.view', label: 'View Themes', group: 'appearance' },
  { key: 'themes.edit', label: 'Edit Themes', group: 'appearance' },
  // Admin & Security
  { key: 'admin.users', label: 'Manage Users', group: 'admin' },
  { key: 'admin.roles', label: 'View Roles', group: 'admin' },
  { key: 'admin.activity', label: 'View Activity Log', group: 'admin' },
];

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS.map(p => p.key),
  EDITOR: [
    'dashboard.view',
    'settings.view', 'settings.edit',
    'navigation.view', 'navigation.edit',
    'maintenance.view',
    'analytics.view',
    'homepage.view', 'homepage.edit',
    'solutions.view', 'solutions.edit',
    'team.view', 'team.edit',
    'media.view', 'media.upload',
    'posts.view', 'posts.edit',
    'leads.view', 'leads.settings',
    'seo.view', 'seo.edit',
    'themes.view', 'themes.edit',
  ],
  CONTENT_MANAGER: [
    'dashboard.view',
    'homepage.view', 'homepage.edit',
    'solutions.view', 'solutions.edit',
    'team.view', 'team.edit',
    'media.view', 'media.upload',
    'posts.view', 'posts.edit',
    'seo.view', 'seo.edit',
  ],
  SUPPORT: [
    'dashboard.view',
    'leads.view',
    'posts.view',
  ],
};

export function hasPermission(role: AdminRole, permissionKey: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permissionKey) ?? false;
}

export function getPermissionsForRole(role: AdminRole): string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function getAllPermissions(): PermissionDef[] {
  return ALL_PERMISSIONS;
}

export { type PermissionDef, type PermissionGroup };
