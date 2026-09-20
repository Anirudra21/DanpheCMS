'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

type ClientItem = {
  name: string;
  logoUrl: string;
};

export default function ClientsContent({ clients }: { clients: ClientItem[] }) {
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
            Our Clients
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            Trusted by 53+ hospitals and healthcare institutions across Nepal and beyond
          </motion.p>
        </div>
      </section>

      {/* Clients Grid */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clients.map((client, i) => (
              <motion.div
                key={`client-${i}-${client.name}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-xl border border-danphe-border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg"
              >
                {client.logoUrl ? (
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image src={client.logoUrl} alt={client.name} fill unoptimized className="object-contain" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-danphe-primary/10">
                    <span className="text-lg font-bold text-danphe-primary">{client.name.charAt(0)}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-danphe-primary truncate">{client.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
