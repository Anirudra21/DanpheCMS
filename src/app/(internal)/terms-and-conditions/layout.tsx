import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | DANPHE',
  description:
    'Read the terms and conditions governing the use of the DANPHE website by Imark Digital Technologies, Kathmandu, Nepal.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
