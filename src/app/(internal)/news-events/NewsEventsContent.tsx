'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

type Article = {
  title: string;
  slug: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string;
  excerpt: string;
};

export default function NewsEventsContent({ articles }: { articles: Article[] }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-danphe-primary via-danphe-dark to-danphe-primary py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 animate-pulse rounded-full bg-danphe-accent/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-danphe-primary-light/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 h-1 w-16 origin-center rounded-full bg-danphe-accent"
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
          >
            News & Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            Stay updated with the latest happenings and upcoming events from Danphe HIMS!
          </motion.p>
        </div>
      </section>

      {/* Articles */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          {articles.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-danphe-text-light">No news or events published yet. Please check back later!</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {articles.map((article, i) => (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="h-full overflow-hidden border-danphe-border transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[16/9]">
                      {article.coverImageUrl ? (
                        <Image
                          src={article.coverImageUrl}
                          alt={article.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div aria-hidden className="h-full w-full bg-gray-50" />
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-center gap-3 text-xs text-danphe-text-light">
                        <span>Posted in: {article.publishedAt}</span>
                        <span>·</span>
                        <span>Posted by: {article.author}</span>
                      </div>
                      <h3 className="mb-3 text-lg font-bold text-danphe-primary line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-danphe-text-light leading-relaxed line-clamp-3">{article.excerpt}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
