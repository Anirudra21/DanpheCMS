import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSolutions, getSolutionBySlug } from '@/lib/queries';
import SolutionDetailClient from './SolutionDetailClient';

export async function generateStaticParams() {
  const solutions = await getSolutions({ published: true });
  return solutions.map((sol) => ({ slug: sol.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(async ({ slug }) => {
    const sol = await getSolutionBySlug(slug);
    if (!sol) return { title: 'Not Found' };
    return {
      title: `${sol.title} - Danphe Health`,
      description: sol.shortDescription,
    };
  });
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sol = await getSolutionBySlug(slug);
  if (!sol) notFound();

  const mod = {
    name: sol.title,
    slug: sol.slug,
    href: `/solution/${sol.slug}`,
    icon: sol.iconUrl,
    title: sol.shortDescription,
    description: sol.shortDescription,
    fullDescription: sol.body,
    features: sol.features.map((f) => f.label),
    image: sol.heroImageUrl,
  };

  return <SolutionDetailClient module={mod} />;
}
