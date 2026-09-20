# Task 3-c: Users Management & Community Page

## Files Created

### API Routes
- `/src/app/api/users/route.ts` — GET (list users, exclude passwordHash) + POST (create user with bcrypt hash, email uniqueness check, min 8 char password, default EDITOR role)
- `/src/app/api/users/[id]/route.ts` — GET (single user, exclude passwordHash) + PUT (update user, conditional password re-hash, role change) + DELETE (cannot delete self via x-admin-id header check)

### Admin Pages
- `/src/app/(admin)/admin/users/page.tsx` — Users list with collapsible inline "Add New User" form (name, email, password type=password, role select). DataTable with Name, Email, Role badge (violet/slate), Created Date columns. Edit/Delete actions.
- `/src/app/(admin)/admin/users/[id]/edit/page.tsx` — Edit user using ModelForm with fields: name (text, required), email (text, required, disabled), password (text, optional, "Leave blank to keep current password"), role (select SUPER_ADMIN/EDITOR). Uses `React.use(props.params)` for params.
- `/src/app/(admin)/admin/community/page.tsx` — Simplified posts list filtered to `?type=COMMUNITY`. DataTable with Title, Status badge, Published Date columns. Create button links to `/admin/posts/new?type=COMMUNITY`. Edit/Delete link to posts routes.

## Key Decisions
- Used `select` in Prisma queries to exclude `passwordHash` from all API responses
- Inline collapsible form for user creation (no separate new page)
- Community page reuses existing Posts API with type filter
- All patterns match existing codebase (DataTable, ModelForm, framer-motion animations, alert dialogs)

## Verification
- `bun run lint` passes with zero errors
