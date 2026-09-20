import { getSolutions } from '@/lib/queries';
import SolutionsContent from './SolutionsContent';

export default async function SolutionsPage() {
  const solutions = await getSolutions({ published: true });

  const mapped = solutions.map((sol) => ({
    name: sol.title,
    slug: sol.slug,
    description: sol.shortDescription,
    icon: sol.iconUrl,
    features: sol.features.map((f) => f.label),
  }));

  return <SolutionsContent solutions={mapped} />;
}
