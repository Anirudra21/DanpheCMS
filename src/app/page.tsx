import Header from '@/components/danphe/Header';
import HeroSection from '@/components/danphe/HeroSection';
import ValueSection from '@/components/danphe/ValueSection';
import ModuleSection from '@/components/danphe/ModuleSection';
import OutcomesSection from '@/components/danphe/OutcomesSection';
import FeaturesSection from '@/components/danphe/FeaturesSection';
import OpenSourceSection from '@/components/danphe/OpenSourceSection';
import TechSection from '@/components/danphe/TechSection';
import ComparisonSection from '@/components/danphe/ComparisonSection';
import InteractiveGlobe, { type GlobeCountryData } from '@/components/danphe/InteractiveGlobe';
import TestimonialsSection from '@/components/danphe/TestimonialsSection';
import TrustedSection from '@/components/danphe/TrustedSection';
import FAQSection from '@/components/danphe/FAQSection';
import ContactSection from '@/components/danphe/ContactSection';
import SubscribeSection from '@/components/danphe/SubscribeSection';
import Footer from '@/components/danphe/Footer';
import ScrollToTop from '@/components/danphe/ScrollToTop';
import StickyContact from '@/components/danphe/StickyContact';
import Preloader from '@/components/danphe/Preloader';
import {
  getHomepageSections,
  getStats,
  getSolutions,
  getTestimonials,
  getClientLogos,
  getSiteSettings,
  getGlobeCountries,
} from '@/lib/queries';
// Force dynamic rendering for this route to avoid static prerender errors
export const dynamic = 'force-dynamic';
import { readFileSync } from 'fs';
import { join } from 'path';

/* ------------------------------------------------------------------ */
/*  Server Component — fetches all homepage data                       */
/* ------------------------------------------------------------------ */
export default async function Home() {
  let sections: any[] = [];
  let allStats: any[] = [];
  let solutions: any[] = [];
  let testimonials: any[] = [];
  let clientLogos: any[] = [];
  let siteSettings: any = null;
  let globeCountries: any[] = [];

  try {
    [sections, allStats, solutions, testimonials, clientLogos, siteSettings, globeCountries] =
      await Promise.all([
        getHomepageSections(),
        getStats(),
        getSolutions({ published: true }),
        getTestimonials(),
        getClientLogos({ showOnHomepage: true }),
        getSiteSettings(),
        getGlobeCountries(),
      ]);
  } catch (err) {
    console.error('Home data fetch failed, falling back to local fixtures:', err);
    try {
      const raw = readFileSync(join(process.cwd(), 'src', 'data', 'public-data-fallback.json'), 'utf-8');
      const json = JSON.parse(raw);
      siteSettings = json.siteSettings ?? null;
      // flatten navByLocation into sections-like structure where needed
      sections = json.homepageSections ?? [];
      allStats = json.stats ?? [];
      solutions = json.solutions ?? [];
      testimonials = json.testimonials ?? [];
      clientLogos = (json.clientLogos ?? []).map((c: any) => ({ ...c, logoUrl: c.logo || c.logoUrl }));
      globeCountries = json.globeCountries ?? [];
    } catch (e) {
      console.error('Failed to read fallback public-data:', e);
      sections = [];
      allStats = [];
      solutions = [];
      testimonials = [];
      clientLogos = [];
      siteSettings = null;
      globeCountries = [];
    }
  }

  /* helper: find a homepage section by key */
  const sec = (key: string) =>
    sections.find((s) => s.key === key) || {
      heading: '',
      subheading: '',
      body: '',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
    };

  /* ── hero ───────────────────────────────────────────────────────── */
  const hero = sec('hero');
  const heroStats = allStats
    .slice(0, 4)
    .map((s) => ({
      label: s.label,
      value: parseInt(s.value, 10) || 0,
      suffix: s.suffix,
    }));

  /* ── trusted ────────────────────────────────────────────────────── */
  const trusted = sec('trusted');
  const clients = clientLogos.map((c) => ({
    name: c.name,
    logo: c.logoUrl,
  }));

  /* ── value_adds ─────────────────────────────────────────────────── */
  const valueAdds = sec('value_adds');
  const valuePoints = String(valueAdds.body || '').split('\n').filter(Boolean);

  /* ── outcomes ───────────────────────────────────────────────────── */
  const outcomes = sec('outcomes');
  const outcomePoints = String(outcomes.body || '').split('\n').filter(Boolean);

  /* ── features_row ───────────────────────────────────────────────── */
  const featuresRow = sec('features_row');
  const featureCards = String(featuresRow.body || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|');
      return {
        title: parts[0] || '',
        description: parts[1] || '',
        icon: parts[2] || '',
      };
    });

  /* ── comparison ─────────────────────────────────────────────────── */
  const comparison = sec('comparison');
  const comparisonCards = String(comparison.body || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|');
      return {
        title: parts[0] || '',
        description: parts[1] || '',
      };
    });

  /* ── opensource ─────────────────────────────────────────────────── */
  const opensource = sec('opensource');
  const openSourceBenefits = String(opensource.body || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|');
      return {
        title: parts[0] || '',
        description: parts[1] || '',
      };
    });

  /* ── technology ─────────────────────────────────────────────────── */
  const tech = sec('technology');
  const techFeatures = String(tech.body || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|');
      return {
        title: parts[0] || '',
        description: parts[1] || '',
        span: parseInt(parts[2], 10) || 1,
      };
    });

  /* ── international ──────────────────────────────────────────────── */
  const international = sec('international');

  /* ── testimonials ───────────────────────────────────────────────── */
  const testimonialsSection = sec('testimonials');
  const testimonialData = testimonials.map((t) => ({
    name: t.authorName,
    quote: t.quote,
    image: t.imageUrl,
  }));

  /* ── faqs ───────────────────────────────────────────────────────── */
  const faqsSection = sec('faqs');
  const faqs = String(faqsSection.body || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|');
      return {
        question: parts[0] || '',
        answer: parts[1] || '',
      };
    });

  /* ── contact ────────────────────────────────────────────────────── */
  const contact = sec('contact');

  /* ── subscribe ──────────────────────────────────────────────────── */
  const subscribe = sec('subscribe');

  /* ── solutions → modules ────────────────────────────────────────── */
  const modules = solutions.map((s) => ({
    name: s.title,
    slug: s.slug,
    href: `/solution/${s.slug}`,
    icon: s.iconUrl,
    title: s.shortDescription,
    description: s.body,
    features: (s.features || []).map((f) => f.label),
    image: s.heroImageUrl,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Preloader />
      <Header />
      <main id="main-content" className="flex-1">
        <HeroSection
          heading={hero.heading}
          subheading={hero.subheading}
          ctaLabel={hero.ctaLabel}
          ctaUrl={hero.ctaUrl}
          stats={heroStats}
        />
        <TrustedSection heading={trusted.heading} clients={clients} />
        <ValueSection
          heading={valueAdds.heading}
          valuePoints={valuePoints}
          image={valueAdds.image}
          ctaLabel={valueAdds.ctaLabel}
          ctaUrl={valueAdds.ctaUrl}
        />
        <ModuleSection modules={modules} />
        <OutcomesSection
          heading={outcomes.heading}
          outcomePoints={outcomePoints}
          image={outcomes.image}
          ctaLabel={outcomes.ctaLabel}
          ctaUrl={outcomes.ctaUrl}
        />
        <FeaturesSection
          heading={featuresRow.heading}
          subheading={featuresRow.subheading}
          featureCards={featureCards}
        />
        <ComparisonSection
          heading={comparison.heading}
          subheading={comparison.subheading}
          cards={comparisonCards}
        />
        <OpenSourceSection
          heading={opensource.heading}
          subheading={opensource.subheading}
          benefits={openSourceBenefits}
        />
        <TechSection
          heading={tech.heading}
          subheading={tech.subheading}
          features={techFeatures}
        />
        <InteractiveGlobe
          heading={international.heading}
          subheading={international.subheading}
          countries={globeCountries as GlobeCountryData[]}
        />
        <TestimonialsSection
          heading={testimonialsSection.heading}
          subheading={testimonialsSection.subheading}
          testimonials={testimonialData}
        />
        <FAQSection
          heading={faqsSection.heading}
          subheading={faqsSection.subheading}
          faqs={faqs}
        />
        <ContactSection
          heading={contact.heading}
          subheading={contact.subheading}
          email={siteSettings?.email || 'info@danphehealth.com'}
        />
        <SubscribeSection
          heading={subscribe.heading}
          subheading={subscribe.subheading}
        />
      </main>
      <Footer className="mt-auto" />
      <ScrollToTop />
      <StickyContact />
    </div>
  );
}
