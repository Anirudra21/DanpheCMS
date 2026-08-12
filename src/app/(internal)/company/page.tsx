'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';

const chooseDanphe = [
  {
    title: 'Feature Rich',
    description: 'DANPHE is a complete HMIS/EMR solutions that encompasses over 32 modules with all the features required to operate a hospital ranging from small to large size.',
  },
  {
    title: 'User Friendly',
    description: 'DANPHE HMIS offers an intuitive user interface, making it easy for users of all computer proficiency levels. Compatible with various devices, including tablets, laptops, desktops, and smartphones.',
  },
  {
    title: 'Easy To Access',
    description: 'DANPHE HMIS is a fully web-based system, enabling access and management of patient data and organization updates from anywhere in the world.',
  },
  {
    title: 'Professional Appearance',
    description: 'DANPHE HMIS enhances patient care with professional management of hospital data. Features like online appointment scheduling and fully integrated EMR and HER streamline patient and hospital management.',
  },
];

const stats = [
  { value: '15+', label: 'Years of Experience' },
  { value: '55+', label: 'Hospitals and Clinics' },
  { value: '130+', label: 'Employees' },
  { value: '30+', label: 'HIMS Modules' },
];

const team = [
  {
    name: 'Ram P. Dhungana',
    role: 'Chairman',
    image: '/team/ram-dhungana.jpg',
  },
  {
    name: 'Dr Prabhat Adhikari, MD',
    role: 'Co-Founder and\nClinical Director',
    image: '/team/prabhat-adhikari.jpg',
  },
  {
    name: 'Shiv P Koirala',
    role: 'Co-Founder and\nTechnical Director',
    image: '/team/shiv-koirala.jpg',
  },
  {
    name: 'Dr.Binod Dhungana, MD, MBA',
    role: 'Co-founder and Director',
    image: '/team/binod-dhungana.jpg',
  },
  {
    name: 'Yubraj Parajuli',
    role: 'Chief Executive Officer',
    image: '/team/yubraj-parajuli.jpg',
  },
];

const serviceCategories = [
  {
    title: 'DANPHE HMIS with EMR',
    items: ['Patient Administration', 'OPD Management', 'IPD Management', 'OT Management'],
  },
  {
    title: 'DANPHE Services',
    items: ['Telemedicine', 'Patient Management', 'Materials (goods) Management', 'Revenue Management'],
  },
];

const patientManagementItems = [
  'Patient Master Setup',
  'Online Appointment Scheduling',
  'Patient Registration',
  'ADT (Admission, Discharge & Transfer)',
  'Referral Management',
  'Medical Records',
  'Queue & Token Management',
  'Patient APP',
];

const materialsManagementItems = [
  'Procurement Management',
  'Inventory Management',
  'Assets Management',
  'Pharmacy Management',
  'Pharmacy Inventory Management',
  'Medical Inventory Management',
];

const revenueManagementItems = [
  'Patient Billing',
  'OP/IP Billing',
  'Discharge Billing',
  'Insurance Billing',
  'SSF Billing',
  'Core Accounting Management',
  'Vendor Payable',
  'Dr. Fraction (Sharing)',
];

const telemedicineFeatures = [
  'Doctor Scheduling',
  'Appointment Booking',
  'Online Patient Vital Inputs',
  'Online Video Consultations',
  'Medical Records Maintenance',
  'Doctor prescription',
  'Need based CHAT features',
];

const supportItems = [
  '9 am to 9 pm call support; 10 pm to 8 am remote support.',
  'Emergency onsite visits available.',
  'Access to expert technical support.',
  'Remote diagnostic support with defined KPIs.',
  'All issues resolved within one working day.',
  'Prompt email service and screen sharing support.',
  'Regular customer feedback and satisfaction research.',
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function CompanyPage() {
  return (
    <>
      {/* Hero Banner */}
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
            Transforming Healthcare with
            <br className="hidden sm:block" />
            {' '}Innovation and Compassionate Expertise
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            Incorporate decision support systems and evidence-based practices for enhanced clinical care.
          </motion.p>
        </div>
      </section>

      {/* About Section */}
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
              <h2 className="mb-4 text-2xl font-bold text-danphe-primary sm:text-3xl">
                Empowering Healthcare Through Customized Software Solutions
              </h2>
              <p className="mb-4 text-danphe-text-light leading-relaxed">
                Harnessing Technology to Transform Healthcare Delivery Worldwide
              </p>
              <p className="text-danphe-text-light leading-relaxed">
                Imark Digital Pvt. Ltd. in Kathmandu, Nepal, delivers tailored healthcare software solutions globally. With over 15 years of experience, we offer cost-effective IT services, leveraging advanced technical skills and a dedicated team of 130+ professionals. Our expertise includes customizable applications, risk assessment, and decision analytics, ensuring clients receive innovative solutions to meet their specific needs.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="grid grid-cols-2 gap-4"
            >
              <Image
                src="https://danphehealth.com/storage/uploads/nc2YYOp5UgiAIZbiOMUj82uxIdG4jlNwKztoLIdn.jpg"
                alt="Danphe team at work"
                width={400}
                height={300}
                unoptimized
                className="rounded-xl shadow-lg"
              />
              <Image
                src="https://danphehealth.com/storage/uploads/oQLbkHz6vDmpHhrZodXRmQiXOv44n7S5MX6WrKbm.jpg"
                alt="Danphe office"
                width={400}
                height={300}
                unoptimized
                className="mt-8 rounded-xl shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Choose Danphe */}
      <section className="bg-danphe-bg-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">Choose Danphe For</h2>
            <p className="mt-3 text-danphe-text-light">
              DANPHE offers a top-notch, affordable Hospital Management Information System with a decade of leadership and quality commitment.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {chooseDanphe.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="h-full border-danphe-border transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="mb-3 text-lg font-bold text-danphe-primary">{item.title}</h3>
                    <p className="text-sm text-danphe-text-light leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">Unveiling Our Pillars of Strength</h2>
            <p className="mt-3 text-danphe-text-light">The Core Attributes and Values that Propel Danphe Forward in Excellence, Innovation, and Client-Centric Success.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-danphe-accent sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm text-danphe-text-light">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-danphe-bg-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">Professional Team Members of DANPHE</h2>
            <p className="mt-3 text-danphe-text-light">Tailored Technologies for Global Healthcare Challenges</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="group h-full overflow-hidden border-danphe-border text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-0">
                    <div className="relative mx-auto mt-5 h-28 w-28 overflow-hidden rounded-full ring-3 ring-danphe-accent/20 ring-offset-2 transition-all duration-300 group-hover:ring-danphe-accent/50 sm:h-32 sm:w-32">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 50vw, 20vw"
                      />
                    </div>
                    <div className="p-4 pb-5">
                      <h3 className="text-sm font-bold text-danphe-primary sm:text-base">{member.name}</h3>
                      <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-danphe-text-light sm:text-sm">{member.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">DANPHE Solutions & Services Overview</h2>
            <p className="mt-3 text-danphe-text-light">Innovative DANPHE solutions streamline healthcare management for enhanced efficiency and patient-centric care.</p>
          </div>

          {/* Patient Management */}
          <div className="mb-12">
            <h3 className="mb-4 text-xl font-bold text-danphe-primary">Patient Management</h3>
            <p className="mb-4 text-danphe-text-light leading-relaxed">
              DANPHE Patient Management involves comprehensive health services to assist patient in managing their health practices like online appointment, queue management through WEB and APP management.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {patientManagementItems.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-danphe-bg-light p-3">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-danphe-accent" />
                  <span className="text-sm text-danphe-text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Materials Management */}
          <div className="mb-12">
            <h3 className="mb-4 text-xl font-bold text-danphe-primary">Materials (goods) Management</h3>
            <p className="mb-4 text-danphe-text-light leading-relaxed">
              Material management involves the process of planning and controlling material flows. It includes planning and procuring materials, supplier's evaluation and selection, purchasing, expenditure, receipt processing, warehousing and inventory and materials distribution (sub-store).
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {materialsManagementItems.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-danphe-bg-light p-3">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-danphe-accent" />
                  <span className="text-sm text-danphe-text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Management */}
          <div className="mb-12">
            <h3 className="mb-4 text-xl font-bold text-danphe-primary">Revenue Management</h3>
            <p className="mb-4 text-danphe-text-light leading-relaxed">
              Revenue management involves financial process facilities use to manage the administrative and clinical functions associated with claims processing, payment, billings, and revenue generation.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {revenueManagementItems.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-danphe-bg-light p-3">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-danphe-accent" />
                  <span className="text-sm text-danphe-text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemedicine */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-danphe-primary">DANPHE Telemedicine</h3>
            <p className="mb-4 text-danphe-text-light leading-relaxed">
              DANPHE Telemedicine is a technology adopted for medicine, health, patients, organizations, and countries. It involves the use of ICT tools in the service of health and is a process that includes providers, users, and health organizations.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {telemedicineFeatures.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-danphe-bg-light p-3">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-danphe-accent" />
                  <span className="text-sm text-danphe-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="bg-danphe-bg-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
              <h2 className="mb-4 text-2xl font-bold text-danphe-primary sm:text-3xl">DANPHE Support Services</h2>
              <p className="mb-6 text-danphe-text-light leading-relaxed">
                We at Imark Digital (DANPHE) give equal emphasis to our personnel, ensuring they understand what customer care and customer delight are all about. Therefore, the management themselves oversee all activities relating to customer services.
              </p>
              <p className="mb-6 font-medium text-danphe-primary">We serve you better with:</p>
              <ul className="space-y-3">
                {supportItems.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danphe-accent" />
                    <span className="text-danphe-text leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src="https://danphehealth.com/storage/uploads/Z5p6J64WddandSwTO03HBpjeNI0dxB2T8rauXZwv.jpg"
                alt="Danphe support team"
                width={600}
                height={450}
                unoptimized
                className="rounded-2xl shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-danphe-primary py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Ready to Transform Your Healthcare Management?</h2>
          <p className="mb-8 text-white/80">
            Join us in embracing the future of healthcare administration, where every aspect of your practice is optimized for enhanced patient care and operational excellence.
          </p>
          <div className="flex flex-col gap-3 justify-center sm:flex-row">
            <Button size="lg" className="bg-danphe-accent hover:bg-danphe-accent-light" asChild>
              <Link href="/schedule-a-demo">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Demo
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/solutions">
                Explore Solutions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
