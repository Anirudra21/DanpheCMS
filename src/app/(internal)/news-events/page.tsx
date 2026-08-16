import { getPosts } from '@/lib/queries';
import NewsEventsContent from './NewsEventsContent';

export default async function NewsEventsPage() {
  const posts = await getPosts({ type: 'NEWS_EVENT', status: 'PUBLISHED' });

  const articles = posts.map((p) => ({
    title: p.title,
    slug: p.slug,
    coverImageUrl: p.coverImageUrl,
    author: p.author,
    publishedAt: p.publishedAt
      ? p.publishedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '',
    excerpt: p.excerpt,
  }));

  return <NewsEventsContent articles={articles} />;
}
