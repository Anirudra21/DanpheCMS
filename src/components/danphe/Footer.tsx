'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronRight,
} from 'lucide-react';

const siteMenu = [
  { label: 'Company', href: '/company' },
  { label: 'Our Clients', href: '/clients' },
  { label: 'Career', href: '/careers' },
  { label: 'News & Events', href: '/news-events' },
  { label: 'Contact Us', href: '/contact' },
];

const hmisMenu = [
  { label: 'Patient Management', href: '/solution/patient-administration' },
  { label: 'Materials (goods) Management', href: '/solution/inventory-management' },
  { label: 'Revenue Management', href: '/solutions' },
  { label: 'Hospital Employee Management (HR Management)', href: '/solutions' },
];

const infoMenu = [
  { label: 'FAQs', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/DapheHealth', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/danphe_health/', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

function FooterColumn({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-heading mb-5 text-base font-semibold text-white">{heading}</h3>
      <div className="mb-5 h-0.5 w-8 bg-gradient-to-r from-danphe-accent to-transparent" />
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  const isInternal = href.startsWith('/');
  const Component = isInternal ? Link : 'a';
  return (
    <li>
      <Component
        href={href}
        className="group flex items-center gap-1 text-sm text-white/60 transition-all duration-300 hover:text-danphe-accent-light hover:pl-1"
      >
        <ChevronRight className="h-3 w-3 opacity-0 -ml-3.5 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" />
        {children}
      </Component>
    </li>
  );
}

function SocialIcon({ icon: Icon, href, label }: { icon: React.ElementType; href: string; label: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-colors duration-300 hover:bg-danphe-accent"
    >
      <Icon className="h-4 w-4 text-white/60 transition-colors duration-300 hover:!text-white" />
    </motion.a>
  );
}

export default function Footer({ className }: { className?: string }) {
  return (
    <footer className={`bg-danphe-dark text-white ${className ?? ''}`} aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Site Menu */}
          <FooterColumn heading="Site Menu">
            <ul className="space-y-3">
              {siteMenu.map((item) => (
                <FooterLink key={item.label} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* HMIS with EMR Solutions */}
          <FooterColumn heading="HMIS with EMR Solutions">
            <ul className="space-y-3">
              {hmisMenu.map((item) => (
                <FooterLink key={item.label} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Info */}
          <FooterColumn heading="Info">
            <ul className="space-y-3">
              {infoMenu.map((item) => (
                <FooterLink key={item.label} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Contact Us */}
          <FooterColumn heading="Contact Us">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/60">
                  Imark Digital Pvt. Ltd. Dillibazar, Kathmandu, Nepal
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/60">
                  +977 9852088004, 9802310817
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <a
                  href="mailto:info@danphehealth.com"
                  className="text-sm text-white/60 transition-colors hover:text-danphe-accent-light"
                >
                  info@danphehealth.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/60">
                  www.danphecare.com / www.danphehealth.com
                </span>
              </li>
            </ul>
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/8 pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-white/40">
              © Copyright 2024. All Rights Reserved.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <SocialIcon
                  key={link.label}
                  icon={link.icon}
                  href={link.href}
                  label={link.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
