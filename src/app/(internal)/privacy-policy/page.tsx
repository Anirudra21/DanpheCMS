'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const sections = [
  {
    heading: 'Collection of Personal Information',
    content: `We may collect personal information that you voluntarily provide to us when you use the Service. The types of personal information we may collect include, but are not limited to:`,
    items: ['Name', 'Contact information such as email, phone number, preferences, and interests', 'Other information relevant to customer surveys and/or offers'],
    trailing: 'We may also collect non-personal information automatically when you use the Service, such as your IP address, browser type, operating system, and usage details.',
  },
  {
    heading: 'Use of Information',
    content: 'We may use the information we collect for various purposes, including but not limited to:',
    items: [
      'Providing and maintaining the Service',
      'Personalizing your experience',
      'Improving the Service',
      'Communicating with you',
      'Responding to your inquiries',
      'Sending you promotional information',
    ],
  },
  {
    heading: 'Disclosure of Information',
    content: 'We may disclose your personal information to third parties only in the following circumstances:',
    items: [
      'With your consent',
      'To comply with legal obligations',
      'To protect and defend our rights or property',
      'In connection with a merger, acquisition, or sale of assets',
    ],
    trailing: 'We will not sell, rent, or lease your personal information to third parties.',
  },
  {
    heading: 'Security of Information',
    content: 'We are committed to ensuring the security of your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. Therefore, we cannot guarantee absolute security.',
  },
  {
    heading: 'Links to Other Websites',
    content: 'The Service may contain links to third-party websites that are not operated by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites.',
  },
  {
    heading: "Children\u2019s Privacy",
    content: 'The Service is not intended for use by children under the age of 16. We do not knowingly collect personal information from children under 16.',
    trailing: 'If you are a parent or guardian and believe that your child has provided us with personal information, please contact us so that we can take appropriate action.',
  },
  {
    heading: 'Changes to This Privacy Policy',
    content: 'We reserve the right to update or change this Privacy Policy at any time. Any changes will be effective immediately upon posting the updated Privacy Policy on the Service.',
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            How we collect, use, and protect your personal information.
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
          <div className="space-y-10 text-danphe-text leading-relaxed">
            {/* Intro */}
            <p>
              At DANPHECARE / DANPHE HEALTH, we are committed to protecting your
              privacy. This Privacy Policy outlines how we collect, use, disclose,
              and safeguard your personal information when you visit our websites{' '}
              <Link href="http://www.danphecare.com" className="text-danphe-accent underline hover:no-underline">
                www.danphecare.com
              </Link>{' '}
              or{' '}
              <Link href="http://www.danphehealth.com" className="text-danphe-accent underline hover:no-underline">
                www.danphehealth.com
              </Link>{' '}
              (hereafter referred to as the &ldquo;Service&rdquo;).
            </p>
            <p>
              By using the Service, you consent to the data practices described in
              this Privacy Policy. If you do not agree with the data practices
              described herein, you should not use the Service.
            </p>

            {/* Sections */}
            {sections.map((sec) => (
              <div key={sec.heading} className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-danphe-primary sm:text-2xl">
                  {sec.heading}
                </h2>
                {sec.content && <p>{sec.content}</p>}
                {sec.items && (
                  <ul className="list-none space-y-3 pl-0">
                    {sec.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danphe-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {sec.trailing && <p>{sec.trailing}</p>}
              </div>
            ))}

            {/* Contact */}
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-danphe-primary sm:text-2xl">
                Contact Us
              </h2>
              <p>
                If you have any questions or concerns about this Privacy Policy,
                please contact us at:
              </p>
              <ul className="list-none space-y-2 pl-0">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danphe-accent" />
                  <span>
                    <strong>Phone:</strong> +977 1 4416468 / 4444217
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danphe-accent" />
                  <span>
                    <strong>Email:</strong>{' '}
                    <Link href="mailto:info@danphecare.com" className="text-danphe-accent underline hover:no-underline">
                      info@danphecare.com
                    </Link>
                  </span>
                </li>
              </ul>
            </div>

            {/* Closing */}
            <p>
              By using the Service, you signify your acceptance of this Privacy
              Policy. If you do not agree to this Privacy Policy, please do not use
              the Service.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
