'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

type ContactFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
};

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
        reset();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={ref}
      id="contact"
      className="relative bg-danphe-bg-alt py-20 md:py-28 dot-pattern-light"
      aria-label="Contact Us"
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading mb-3 text-3xl font-bold text-danphe-primary md:text-4xl">
            Let us know how we can help you.
          </h2>
          <p className="text-danphe-text-light">
            You can send an email to{' '}
            <a
              href="mailto:info@danphehealth.com"
              className="font-medium text-danphe-accent hover:underline"
            >
              info@danphehealth.com
            </a>
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 border border-danphe-success/20 rounded-3xl bg-danphe-success/5 p-10 text-center">
                <CheckCircle className="h-12 w-12 text-danphe-success" />
                <h3 className="text-xl font-bold text-danphe-primary">Thank you!</h3>
                <p className="text-danphe-text-light">
                  Your message has been sent successfully. We will get back to you soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-sm font-medium text-danphe-accent transition-colors hover:text-danphe-accent-light"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="glass rounded-3xl p-6 shadow-premium-lg md:p-8 space-y-5"
                noValidate
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-danphe-text"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="First Name"
                      {...register('firstName', { required: 'First name is required' })}
                      aria-invalid={!!errors.firstName}
                      className="h-11 w-full rounded-xl border border-danphe-border bg-white/80 px-4 text-sm text-danphe-text outline-none transition-all placeholder:text-danphe-text-light/50 focus-visible:ring-2 focus-visible:ring-danphe-accent/30 focus-visible:border-danphe-accent/50"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-danphe-text"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Last Name"
                      {...register('lastName', { required: 'Last name is required' })}
                      aria-invalid={!!errors.lastName}
                      className="h-11 w-full rounded-xl border border-danphe-border bg-white/80 px-4 text-sm text-danphe-text outline-none transition-all placeholder:text-danphe-text-light/50 focus-visible:ring-2 focus-visible:ring-danphe-accent/30 focus-visible:border-danphe-accent/50"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-danphe-text"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Phone Number"
                      {...register('phone', { required: 'Phone number is required' })}
                      aria-invalid={!!errors.phone}
                      className="h-11 w-full rounded-xl border border-danphe-border bg-white/80 px-4 text-sm text-danphe-text outline-none transition-all placeholder:text-danphe-text-light/50 focus-visible:ring-2 focus-visible:ring-danphe-accent/30 focus-visible:border-danphe-accent/50"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-danphe-text"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Invalid email address',
                        },
                      })}
                      aria-invalid={!!errors.email}
                      className="h-11 w-full rounded-xl border border-danphe-border bg-white/80 px-4 text-sm text-danphe-text outline-none transition-all placeholder:text-danphe-text-light/50 focus-visible:ring-2 focus-visible:ring-danphe-accent/30 focus-visible:border-danphe-accent/50"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-danphe-text"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    placeholder="Your message..."
                    rows={5}
                    {...register('message', { required: 'Message is required' })}
                    aria-invalid={!!errors.message}
                    className="w-full rounded-xl border border-danphe-border bg-white/80 px-4 py-3 text-sm text-danphe-text outline-none transition-all placeholder:text-danphe-text-light/50 focus-visible:ring-2 focus-visible:ring-danphe-accent/30 focus-visible:border-danphe-accent/50 resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-danphe-accent px-8 py-3 font-semibold text-white shadow-glow-accent transition-all hover:bg-danphe-accent-light disabled:opacity-60"
                >
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="h-full min-h-[400px] overflow-hidden rounded-3xl border border-danphe-border/30 shadow-premium-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.32398903228!2d85.32684882524008!3d27.707281275494772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197f4baea3f5%3A0x55e4bb647cf623f8!2sImark%20Digital!5e0!3m2!1sen!2snp!4v1707112335014!5m2!1sen!2snp"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Danphe Health Office Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
