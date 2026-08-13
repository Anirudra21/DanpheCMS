'use client';

import { SessionProvider } from 'next-auth/react';

export { authOptions } from '@/lib/auth';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
