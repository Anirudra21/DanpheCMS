'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const newsArticles = [
  {
    title: '2023 Recap of AI developments',
    date: '2024-01-03',
    author: 'Digwatch',
    image: 'https://danphehealth.com/storage/uploads/qJC8UWbueNgrVxOUzwXyz4vAXQi9zxmNFD2dBWU9.png',
    excerpt:
      "In the swiftly evolving landscape of the artificial intelegence technology, returning to the incipit of this revolutionary invention's precise moment of origin is complex. However, in the third decade of the 20th century, the earliest materialisation of such ideas and concepts occurred in literature.",
  },
  {
    title: 'Navigating the Healthcare Landscape: A Comprehensive Guide to HIPAA Compliance in Hospitals.',
    date: '2024-01-08',
    author: 'Danphe Health',
    image: 'https://danphehealth.com/storage/uploads/UCplaL4d4WzJAv9ZxgqTOUIpvHGjL2ZPj6jOnDdf.jpg',
    excerpt:
      'In the ever-evolving realm of healthcare, safeguarding patient information is of paramount importance. The Health Insurance Portability and Accountability Act (HIPAA) plays a central role in ensuring the confidentiality, integrity, and availability of patient data.',
  },
  {
    title: 'How do electronic health records (EHR or EMR) make healthcare better?',
    date: '2023-02-17',
    author: 'Eduhealth System',
    image: 'https://danphehealth.com/storage/uploads/h2HDNsv5bp2mI8WG9xv7spFXiQFhIWlr2hUMHLG5.jpg',
    excerpt:
      'There is a growing interest in EHRs around the world. Technology and innovations are changing the health industry, governments and organizations are focusing on providing better health services to the public.',
  },
  {
    title: 'Importance of Electronic Health Records in Nursing',
    date: '2023-05-04',
    author: 'Regis College',
    image: 'https://danphehealth.com/storage/uploads/an0lprVHccGkqUYrQk6A3spAlUjZWuVMB7E1gUo0.jpg',
    excerpt:
      'In 2009, only 12% of hospitals used EHRs, according to the Office of the National Coordinator for Health Information Technology. By 2021 — thanks in part to $27 billion in financial incentives from Congress — EHRs were almost universal, with 96% of hospitals adopting them.',
  },
];

export default function NewsEventsPage() {
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
          <div className="grid gap-8 sm:grid-cols-2">
            {newsArticles.map((article, i) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full overflow-hidden border-danphe-border transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-3 text-xs text-danphe-text-light">
                      <span>Posted in: {article.date}</span>
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
        </div>
      </section>
    </>
  );
}
