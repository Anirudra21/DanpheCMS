'use client';

import { SITE_URL } from '@/lib/constants';
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';

const siteMenu = [
  { label: 'Company', href: `${SITE_URL}/company` },
  { label: 'Our Clients', href: `${SITE_URL}/clients` },
  { label: 'Career', href: `${SITE_URL}/careers` },
  { label: 'News & Events', href: `${SITE_URL}/news-event` },
  { label: 'Contact Us', href: `${SITE_URL}/contact` },
];

const hmisMenu = [
  { label: 'Patient Management', href: '#' },
  { label: 'Materials (goods) Management', href: '#' },
  { label: 'Revenue Management', href: '#' },
  { label: 'Hospital Employee Management (HR Management)', href: '#' },
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

export default function Footer({ className }: { className?: string }) {
  return (
    <footer className={`bg-danphe-dark text-white ${className ?? ''}`} aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Site Menu */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Site Menu</h3>
            <ul className="space-y-3">
              {siteMenu.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-danphe-accent-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-danphe-accent-light" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* HMIS with EMR Solutions */}
          <div>
            <h3 className="mb-5 text-lg font-bold">HMIS with EMR Solutions</h3>
            <ul className="space-y-3">
              {hmisMenu.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-danphe-accent-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-danphe-accent-light" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Info</h3>
            <ul className="space-y-3">
              {infoMenu.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-danphe-accent-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-danphe-accent-light" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/70">
                  Imark Digital Pvt. Ltd. Dillibazar, Kathmandu, Nepal
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/70">
                  +977 9852088004, 9802310817
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <a
                  href="mailto:info@danphehealth.com"
                  className="text-sm text-white/70 transition-colors hover:text-danphe-accent-light"
                >
                  info@danphehealth.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/70">
                  www.danphecare.com / www.danphehealth.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social icons and divider */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-white/50">
              © Copyright 2024. All Rights Reserved.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-danphe-accent hover:scale-110"
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
