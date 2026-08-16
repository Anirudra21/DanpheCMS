'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, CheckCircle } from 'lucide-react';

type SolutionItem = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
};

const additionalModules = [
  {
    name: 'Radiology Management',
    description:
      'The radiology module allows you to choose from multiple tests and promptly make the results available. It is designed to seamlessly integrate medical imaging into the complete clinical workflow, including registration, billing, test report entry, levels, interface with machines, and covers various reports such as radiology, X-ray, ultrasound, CT scan, and report printing, among others.',
  },
  {
    name: 'Finance And Account Management',
    description:
      'The financial module oversees and efficiently manages the entire monetary flow, ensuring transparency and accountability to optimize financial goals.',
  },
  {
    name: 'HR & Payroll Management',
    description:
      'The HR & Payroll Management module encompasses routine activities of HRD and tasks related to existing employees, including attendance and leave management, loan processing, TOTA registers, and onboarding of new hires, including contractual employees.',
  },
  {
    name: 'Emergency Management',
    description:
      'The Emergency module assists in registering and managing emergency cases and patients. It tracks the triage of the patient, manages billing, and records the outcome of patients. The purpose of the module is to effectively manage emergency patients and their associated information, thereby enhancing emergency treatment and patient management.',
  },
  {
    name: 'Telehealth Application',
    description:
      'Telehealth applications enable healthcare providers to deliver medical services remotely to patients via video conferencing or other electronic communication technologies. These applications allow healthcare providers to diagnose and treat patients who are unable to visit the clinic or hospital in person. Additionally, telehealth applications reduce the risk of infection for both patients and healthcare providers.',
  },
  {
    name: 'Health Insurance',
    description:
      'DANPHE incorporates the GoVN-HIB module, seamlessly managing insurance processes to settle patient bills covered under insurance policies. It facilitates patient eligibility verification for reimbursement purposes, making tracking claim statuses hassle-free within our DANPHE application.',
  },
];

const basicFeatures = [
  'Patient Appointment (Web Based) & Registration System',
  'Patient Billing System (OP/IP/Discharge etc.)',
  'Dr. Fraction (Sharing) System- General',
  'Dr. Fraction (Sharing) System- Dynamic',
  'Patient Admision, Discharge and Transfer (ADT)',
  'Laboratory Management System (LAB)',
  'Radiology Management System',
  'Pharmacy Management System',
  'Procurement & Inventory Management System',
  'Inventory Sub-Store Management System',
  'Assets Management System',
  'Integrated Accounting Management System',
  'Personal (Staff) Information Management System',
  'Staff Leave Management System',
  'Staff Payroll Management System',
  'Attendance Management System (Realtime Sync through Biometric Devices)',
  'Emergency Management System',
  'In-Patient Clinical Management System',
  'Out-Patient Clinical Management System',
  'Nursing Station Management System',
  'OT Management System',
  'Medical Discharge Summary Management System (ward-wise)',
  'Medical Record Management System (General-Manual Entry)',
  'Medical Record Management System (Integrated with EMR)',
  'Patient Queue Management System',
  'Patient Appointment (Mobile APP-Android)',
  'Managerial Reporting with DASHBOARD',
];

const advanceFeatures = [
  'Specific ADD-ONS Integration Modules',
  'Government Health Insurance Integration with Real time Claim Management',
  'Social Security Fund (SSF) Integration',
  'Ex-Servicemen Contributory Health Scheme (ECHS) Integration.',
  'Online Payment Integration with Online Appointment System (Digital Wallets, Debit Cards, Credit Cards etc)',
  'Teleconsultation Platform',
  'Online Consultation Platform (Telemedicine Service) with EMR integration',
  'LIS & PACS Integration',
  'LAB Machine Interfacing (Bi-Directional)',
  'PACS Integration with DANPHE HMIS',
];

export default function SolutionsContent({ solutions }: { solutions: SolutionItem[] }) {
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
            Unleash Efficiency with Our HIMS Modules!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-white/80 sm:text-lg"
          >
            Discover streamlined healthcare finances with our revolutionary HIMS billing modules—ensuring precision, efficiency, and compliance for healthcare providers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" className="bg-danphe-accent hover:bg-danphe-accent-light" asChild>
              <Link href="/schedule-a-demo">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Demo
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Main 9 Modules Grid */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">Explore our HIMS Module</h2>
            <p className="mt-3 text-danphe-text-light">Precision in Healthcare Information Management</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((sol, i) => (
              <motion.div
                key={sol.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="group h-full overflow-hidden border-danphe-border transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <Image src={sol.icon} alt={sol.name} width={32} height={32} unoptimized className="h-8 w-8" />
                      <h3 className="text-lg font-bold text-danphe-primary">{sol.name}</h3>
                    </div>
                    <p className="mb-4 text-sm text-danphe-text-light leading-relaxed line-clamp-3">
                      {sol.description}
                    </p>
                    <Link
                      href={`/solution/${sol.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-danphe-accent transition-colors hover:text-danphe-accent-light"
                    >
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Modules */}
      <section className="bg-danphe-bg-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">Additional Modules</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {additionalModules.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full border-danphe-border">
                  <CardContent className="p-6">
                    <h3 className="mb-3 text-lg font-bold text-danphe-primary">{mod.name}</h3>
                    <p className="text-sm text-danphe-text-light leading-relaxed">{mod.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison Table */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">Find the Platform that is Right for You</h2>
            <p className="mt-3 text-danphe-text-light">Align it with your audience, content, and goals for maximum impact and growth.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-danphe-border">
              <CardContent className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-bold text-danphe-primary">Basic</h3>
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {basicFeatures.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danphe-accent" />
                      <span className="text-sm text-danphe-text">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-danphe-accent/50 bg-danphe-accent/5">
              <CardContent className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-bold text-danphe-accent">Advance</h3>
                <ul className="space-y-3">
                  {advanceFeatures.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danphe-accent" />
                      <span className="text-sm text-danphe-text">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
