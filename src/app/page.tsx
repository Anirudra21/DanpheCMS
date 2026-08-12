import Header from '@/components/danphe/Header';
import HeroSection from '@/components/danphe/HeroSection';
import ValueSection from '@/components/danphe/ValueSection';
import ModuleSection from '@/components/danphe/ModuleSection';
import OutcomesSection from '@/components/danphe/OutcomesSection';
import FeaturesSection from '@/components/danphe/FeaturesSection';
import OpenSourceSection from '@/components/danphe/OpenSourceSection';
import TechSection from '@/components/danphe/TechSection';
import ComparisonSection from '@/components/danphe/ComparisonSection';
import InternationalSection from '@/components/danphe/InternationalSection';
import TestimonialsSection from '@/components/danphe/TestimonialsSection';
import TrustedSection from '@/components/danphe/TrustedSection';
import FAQSection from '@/components/danphe/FAQSection';
import ContactSection from '@/components/danphe/ContactSection';
import SubscribeSection from '@/components/danphe/SubscribeSection';
import Footer from '@/components/danphe/Footer';
import ScrollToTop from '@/components/danphe/ScrollToTop';
import StickyContact from '@/components/danphe/StickyContact';
import Preloader from '@/components/danphe/Preloader';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Preloader />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustedSection />
        <ValueSection />
        <ModuleSection />
        <OutcomesSection />
        <FeaturesSection />
        <ComparisonSection />
        <OpenSourceSection />
        <TechSection />
        <InternationalSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
        <SubscribeSection />
      </main>
      <Footer className="mt-auto" />
      <ScrollToTop />
      <StickyContact />
    </div>
  );
}
