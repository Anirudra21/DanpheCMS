'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-6 max-w-md px-4"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-danphe-text">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have the required permissions to access this page.
            Contact your administrator if you believe this is an error.
          </p>
        </div>
        <Button asChild variant="outline" className="border-danphe-border">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
