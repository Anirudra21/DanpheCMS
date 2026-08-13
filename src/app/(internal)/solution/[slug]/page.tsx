import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MODULES, SHARED_FAQS } from '@/lib/constants';
import SolutionDetailClient from './SolutionDetailClient';

export function generateStaticParams() {
  return MODULES.map((mod) => ({ slug: mod.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const mod = MODULES.find((m) => m.slug === slug);
    if (!mod) return { title: 'Not Found' };
    return {
      title: `${mod.name} - Danphe Health`,
      description: mod.description,
    };
  });
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = MODULES.find((m) => m.slug === slug);
  if (!mod) notFound();

  return <SolutionDetailClient module={mod} />;
}
