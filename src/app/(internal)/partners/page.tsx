'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, ArrowRight, Handshake } from 'lucide-react';

const benefits = [
  'Access to a proven, market-leading HMIS/EMR product with 15+ years of track record',
  'Comprehensive training and onboarding support for your team',
  'Marketing and sales collateral to help you represent Danphe effectively',
  'Technical support and product updates to keep you competitive',
  'Flexible partnership models to suit your business needs',
  'Revenue sharing on successful implementations',
];

export default function PartnersPage() {
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
            Partners
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            Join hands with Danphe Health to bring world-class hospital management solutions to healthcare institutions in your region.
          </motion.p>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
              <h2 className="mb-4 text-2xl font-bold text-danphe-primary sm:text-3xl">Why Partner with Danphe?</h2>
              <p className="mb-6 text-danphe-text-light leading-relaxed">
                Danphe Health by Imark Digital Pvt. Ltd. is a leading provider of Hospital Information Management Systems (HIMS) with Electronic Medical Records (EMR). We are looking for passionate partners to expand our reach and bring our proven solution to more healthcare institutions globally.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danphe-accent" />
                    <span className="text-danphe-text leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Card className="border-danphe-border">
                <CardContent className="p-8 text-center">
                  <Handshake className="mx-auto mb-4 h-16 w-16 text-danphe-accent" />
                  <h3 className="mb-3 text-xl font-bold text-danphe-primary">Become a Partner</h3>
                  <p className="mb-6 text-danphe-text-light">
                    Interested in partnering with us? Reach out to discuss partnership opportunities in your region.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button className="bg-danphe-primary hover:bg-danphe-primary-light" asChild>
                      <Link href="/contact">
                        <Calendar className="mr-2 h-4 w-4" />
                        Contact Us
                      </Link>
                    </Button>
                    <Button variant="outline" className="border-danphe-primary text-danphe-primary hover:bg-danphe-primary hover:text-white" asChild>
                      <Link href="/schedule-a-demo">
                        Schedule a Demo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
