'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Send } from 'lucide-react';

const countries = [
  'Nepal',
  'India',
  'China',
  'Australia',
  'Japan',
  'South Korea',
  'Thailand',
  'Malaysia',
  'Indonesia',
  'Vietnam',
  'Singapore',
  'Philippines',
  'Pakistan',
  'Bangladesh',
  'Sri Lanka',
  'Myanmar',
  'Cambodia',
  'Laos',
  'Mongolia',
  'Bhutan',
];

const hospitalSizes = [
  '1-25 Bedded',
  '26-50 Bedded',
  '51-100 Bedded',
  '101-200 Bedded',
  'Above 201 Bedded',
];

const hospitalTypes = [
  'Clinic',
  'Diagnostic Center',
  'Pharmacy',
  'Government Hospital',
  'Private Hospital',
  'Medical College',
];

export default function ScheduleDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    organizationName: '',
    hospitalSize: '',
    hospitalType: '',
    message: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const required = ['firstName', 'lastName', 'email', 'phone', 'country', 'address', 'organizationName', 'hospitalType'];
  const isFormValid = required.every((f) => formData[f as keyof typeof formData].trim());

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center rounded-2xl border border-danphe-success/30 bg-danphe-success/5 p-10"
        >
          <CheckCircle className="mx-auto mb-4 h-14 w-14 text-danphe-success" />
          <h2 className="mb-3 text-2xl font-bold text-danphe-primary">Thank you for your interest!</h2>
          <p className="text-danphe-text-light">
            Kindly complete the form, and our dedicated sales associate will contact you within the next 24 hours.
          </p>
        </motion.div>
      </div>
    );
  }

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
            Schedule a demo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            Thank you for your interest! We would be delighted to learn more about your practice and provide you with comprehensive information about Danphe.
          </motion.p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <p className="mb-8 text-center text-danphe-text-light">
            Kindly complete the form, and our dedicated sales associate will contact you within the next 24 hours
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demo-firstName">First Name *</Label>
                <Input id="demo-firstName" placeholder="First Name" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-lastName">Last Name *</Label>
                <Input id="demo-lastName" placeholder="Last Name" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email address *</Label>
                <Input id="demo-email" type="email" placeholder="Email address" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-phone">Phone Number *</Label>
                <Input id="demo-phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={formData.country} onValueChange={(v) => handleChange('country', v)}>
                  <SelectTrigger><SelectValue placeholder="--Select Country--" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-address">Address *</Label>
                <Input id="demo-address" placeholder="Address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-org">Organization Name *</Label>
              <Input id="demo-org" placeholder="Organization Name" value={formData.organizationName} onChange={(e) => handleChange('organizationName', e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Health Institution Size</Label>
                <Select value={formData.hospitalSize} onValueChange={(v) => handleChange('hospitalSize', v)}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    {hospitalSizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hospital Type *</Label>
                <Select value={formData.hospitalType} onValueChange={(v) => handleChange('hospitalType', v)}>
                  <SelectTrigger><SelectValue placeholder="--Select a Hospital Type--" /></SelectTrigger>
                  <SelectContent>
                    {hospitalTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-message">Message</Label>
              <Textarea id="demo-message" placeholder="Your message..." rows={4} value={formData.message} onChange={(e) => handleChange('message', e.target.value)} />
            </div>
            <p className="text-xs text-danphe-text-light">
              By clicking &quot;Submit&quot; I agree to the{' '}
              <a href="#" className="text-danphe-accent hover:underline">Privacy Policy</a>
              {' '}and{' '}
              <a href="#" className="text-danphe-accent hover:underline">Terms of Use</a>.
            </p>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-danphe-primary hover:bg-danphe-primary-light sm:w-auto"
              disabled={loading || !isFormValid}
            >
              {loading ? 'Submitting...' : <><Send className="mr-2 h-4 w-4" />Request Now</>}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
