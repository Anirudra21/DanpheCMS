'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';

type ContactFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
};

const contactCards = [
  {
    title: 'For Sales Enquiry',
    name: 'Yubraj Parajuli',
    email: 'yubraj.parajuli@danphecare.com',
    phone: '+977-9852088004',
  },
  {
    title: 'For Hospital Technical Support',
    name: 'Support Team',
    email: 'support@danphecare.com',
    phone: '+977-9802332018',
  },
  {
    title: 'For Business Partner / Agent',
    name: 'Yubraj Parajuli',
    email: 'yubraj.parajuli@danphecare.com',
    phone: '+977-9852088004',
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            Imark Digital Pvt. Ltd. (Danphe)<br />
            Niketan Marg, Dillibazar, Kathmandu, Nepal<br />
            Email: info@danphecare.com
          </motion.p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            {contactCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full border-danphe-border text-center">
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-bold text-danphe-primary">{card.title}</h3>
                    <div className="space-y-3 text-sm">
                      <a href={`mailto:${card.email}`} className="flex items-center justify-center gap-2 text-danphe-text-light hover:text-danphe-accent">
                        <Mail className="h-4 w-4" />
                        {card.email}
                      </a>
                      <a href={`tel:${card.phone.replace(/[^+0-9]/g, '')}`} className="flex items-center justify-center gap-2 text-danphe-text-light hover:text-danphe-accent">
                        <Phone className="h-4 w-4" />
                        {card.phone}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact details bar */}
          <div className="mb-12 flex flex-wrap justify-center gap-8 text-sm text-danphe-text-light">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-danphe-accent" />
              <span>+977-1-4416468, +977-1-4444217</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-danphe-accent" />
              <a href="mailto:info@imark.com.np" className="hover:text-danphe-accent">info@imark.com.np</a>
              {' / '}
              <a href="mailto:support@imark.com" className="hover:text-danphe-accent">support@imark.com</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-danphe-accent" />
              <span>302 Paoli Woods, Paoli, PA 19301</span>
            </div>
          </div>

          {/* Form + Map */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-danphe-success/30 bg-danphe-success/5 p-10 text-center">
                <CheckCircle className="h-12 w-12 text-danphe-success" />
                <h3 className="text-xl font-bold text-danphe-primary">Thank you!</h3>
                <p className="text-danphe-text-light">
                  Your message has been sent successfully. We will get back to you soon.
                </p>
                <Button
                  variant="outline"
                  className="mt-2 border-danphe-primary text-danphe-primary"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="c-firstName">First Name *</Label>
                    <Input
                      id="c-firstName"
                      placeholder="First Name"
                      {...register('firstName', { required: 'First name is required' })}
                    />
                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-lastName">Last Name *</Label>
                    <Input
                      id="c-lastName"
                      placeholder="Last Name"
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                    {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="c-phone">Phone Number *</Label>
                    <Input
                      id="c-phone"
                      type="tel"
                      placeholder="Phone Number"
                      {...register('phone', { required: 'Phone number is required' })}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email">Email address *</Label>
                    <Input
                      id="c-email"
                      type="email"
                      placeholder="Email address"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                      })}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-message">Message *</Label>
                  <Textarea
                    id="c-message"
                    placeholder="Your message..."
                    rows={5}
                    {...register('message', { required: 'Message is required' })}
                  />
                  {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-danphe-primary hover:bg-danphe-primary-light sm:w-auto"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : <><Send className="mr-2 h-4 w-4" />Send Message</>}
                </Button>
              </form>
            )}
            <div className="overflow-hidden rounded-2xl border border-danphe-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.32398903228!2d85.32684882524008!3d27.707281275494772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197f4baea3f5%3A0x55e4bb647cf623f8!2sImark%20Digital!5e0!3m2!1sen!2snp!4v1707112335014!5m2!1sen!2snp"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '450px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Danphe Health Office Location"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
