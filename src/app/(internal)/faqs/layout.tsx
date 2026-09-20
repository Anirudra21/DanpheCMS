import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQs | DANPHE',
  description:
    'Find answers to frequently asked questions about DANPHE Health Hospital Management System.',
};

export default function FAQsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
