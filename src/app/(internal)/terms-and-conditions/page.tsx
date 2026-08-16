'use client';

import { motion } from 'framer-motion';

export default function TermsAndConditionsPage() {
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
            className="mb-4 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
          >
            Terms & Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            Please read these terms carefully before using our website.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl px-4"
        >
          <h2 className="mb-6 font-heading text-2xl font-bold text-danphe-primary sm:text-3xl">
            Terms And Conditions
          </h2>

          <div className="space-y-6 text-danphe-text leading-relaxed">
            <p>
              Welcome to the DANPHE website. By continuing to browse and use this
              website, you agree to comply with and be bound by the following terms
              and conditions of use, which, together with our privacy policy, govern
              Imark Digital Technologies&rsquo; relationship with you concerning this
              website. If you disagree with any part of these terms and conditions,
              please refrain from using our website.
            </p>

            <p>
              The terms &lsquo;Imark Digital,&rsquo; &lsquo;DANPHE,&rsquo;
              &lsquo;us,&rsquo; or &lsquo;we&rsquo; refer to the owner of the
              website whose registered office is located in Kathmandu, Nepal. Our
              company registration number is{' '}
              <strong>150593/72/073</strong>. The term &lsquo;you&rsquo; refers to
              the user or viewer of our website.
            </p>

            <p className="font-heading text-lg font-semibold text-danphe-dark">
              The use of this website is subject to the following terms of use:
            </p>

            <ul className="list-none space-y-5 pl-0">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danphe-accent" />
                <span>
                  The content of the pages of this website is for your general
                  information and use only. It is subject to change without notice.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danphe-accent" />
                <span>
                  This website uses cookies to monitor browsing preferences. If you
                  allow cookies to be used, the following personal information may
                  be stored by us for use by third parties.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danphe-accent" />
                <span>
                  Neither we nor any third parties provide any warranty or guarantee
                  as to the accuracy, timeliness, performance, completeness, or
                  suitability of the information and materials found or offered on
                  this website for any particular purpose. You acknowledge that such
                  information and materials may contain inaccuracies or errors, and
                  we expressly exclude liability for any such inaccuracies or errors
                  to the fullest extent permitted by law.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danphe-accent" />
                <span>
                  Your use of any information or materials on this website is entirely
                  at your own risk, for which we shall not be liable. It is your
                  responsibility to ensure that any products, services, or
                  information available through this website meet your specific
                  requirements.
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </section>
    </>
  );
}
