'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle } from 'lucide-react';

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
    <section id="contact" className="bg-white py-16 sm:py-20 lg:py-24" aria-label="Contact Us">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-danphe-primary sm:text-3xl lg:text-4xl">
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
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Form */}
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
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    {...register('firstName', { required: 'First name is required' })}
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    {...register('lastName', { required: 'Last name is required' })}
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    {...register('phone', { required: 'Phone number is required' })}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
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
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your message..."
                  rows={5}
                  {...register('message', { required: 'Message is required' })}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p className="text-xs text-red-500">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-danphe-primary hover:bg-danphe-primary-light sm:w-auto"
                disabled={loading}
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-danphe-border">
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
        </div>
      </div>
    </section>
  );
}
