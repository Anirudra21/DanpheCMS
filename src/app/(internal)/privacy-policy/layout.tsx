import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DANPHE',
  description:
    'Learn how DANPHECARE / DANPHE HEALTH collects, uses, discloses, and safeguards your personal information.',
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
