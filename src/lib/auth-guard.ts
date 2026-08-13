import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

/**
 * Server-side auth guard. Call in layout.tsx or page.tsx (server component).
 * Redirects to /admin/login if not authenticated.
 */
export async function requireAuth(minRole?: UserRole) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const role = (session.user as Record<string, unknown>).role as UserRole | undefined;

  if (minRole && role && ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
    redirect("/admin/unauthorized");
  }

  return {
    user: session.user,
    role: role ?? "VIEWER" as UserRole,
  };
}

/**
 * Check if the current user has a specific permission level.
 */
export function hasPermission(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}
