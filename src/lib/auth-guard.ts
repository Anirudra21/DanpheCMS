import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export type AdminRole = "SUPER_ADMIN" | "EDITOR";

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  SUPER_ADMIN: 2,
  EDITOR: 1,
};

/**
 * Server-side auth guard. Call in layout.tsx or page.tsx (server component).
 * Redirects to /admin/login if not authenticated.
 */
export async function requireAuth(minRole?: AdminRole) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const role = (session.user as Record<string, unknown>).role as AdminRole | undefined;

  if (minRole && role && ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
    redirect("/admin/unauthorized");
  }

  return {
    user: session.user,
    role: role ?? ("EDITOR" as AdminRole),
  };
}

/**
 * Check if the current user has a specific permission level.
 */
export function hasPermission(userRole: AdminRole, minRole: AdminRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}
