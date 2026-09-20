'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Calendar, MapPin, Building, Briefcase } from 'lucide-react';

type Job = {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  applyEmail: string;
  description: string;
  postedAt: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function CareersContent({ jobs }: { jobs: Job[] }) {
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
            className="mb-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
          >
            Career opportunities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl font-medium text-danphe-accent-light sm:text-3xl"
          >
            Do your best work at Danphe
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-6 text-danphe-text leading-relaxed">
                Danphe Health is here to provide you a learning platform not only on technical aspects but also on emotional and social arenas. We invite you to be a part of our amazing success story through exciting growth opportunities. Our company can proudly say that we as employers feel employees&apos; as valuable assets, who are provided guidance and support in a dynamic environment.
              </p>
              <p className="mb-8 text-danphe-text-light leading-relaxed">
                Check out our open roles below – if you don&apos;t see one that matches your talents, please send message on{' '}
                <a href="mailto:info@danphehealth.com" className="font-medium text-danphe-accent hover:underline">
                  info@danphehealth.com
                </a>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="bg-danphe-primary hover:bg-danphe-primary-light" asChild>
                  <a href="mailto:info@danphehealth.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Your Resume
                  </a>
                </Button>
                <Button variant="outline" className="border-danphe-primary text-danphe-primary hover:bg-danphe-primary hover:text-white" asChild>
                  <Link href="/company">
                    <Calendar className="mr-2 h-4 w-4" />
                    Learn About Us
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Image
                src="/images/content/image33.jpg"
                alt="Danphe team"
                width={600}
                height={450}
                unoptimized
                className="rounded-2xl shadow-xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Job Listings or No Open Positions */}
      {jobs.length > 0 ? (
        <section className="bg-danphe-bg-light py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
              <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">Open Positions</h2>
              <p className="mt-3 text-danphe-text-light">Explore exciting career opportunities at Danphe Health</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-danphe-border transition-shadow hover:shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="mb-4 text-lg font-bold text-danphe-primary">{job.title}</h3>
                      <div className="mb-4 space-y-2 text-sm text-danphe-text-light">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 flex-shrink-0 text-danphe-accent" />
                          <span>{job.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-danphe-accent" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 flex-shrink-0 text-danphe-accent" />
                          <span>{job.employmentType}</span>
                        </div>
                      </div>
                      <p className="mb-5 text-sm text-danphe-text-light leading-relaxed line-clamp-3">{job.description}</p>
                      <Button size="sm" className="w-full bg-danphe-primary hover:bg-danphe-primary-light" asChild>
                        <a href={`mailto:${job.applyEmail}?subject=Application for ${job.title}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Apply via Email
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-danphe-bg-light py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danphe-primary/10">
                <Mail className="h-10 w-10 text-danphe-primary" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-danphe-primary sm:text-3xl">No Open Positions Currently</h2>
              <p className="mb-8 text-danphe-text-light">
                We are always looking for talented individuals to join our team. Please send your resume to{' '}
                <a href="mailto:info@danphehealth.com" className="font-medium text-danphe-accent hover:underline">
                  info@danphehealth.com
                </a>
                {' '}and we will reach out when a suitable position opens up.
              </p>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}
