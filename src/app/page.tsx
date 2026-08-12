import Header from '@/components/danphe/Header';
import HeroSection from '@/components/danphe/HeroSection';
import ValueSection from '@/components/danphe/ValueSection';
import ModuleSection from '@/components/danphe/ModuleSection';
import OutcomesSection from '@/components/danphe/OutcomesSection';
import FeaturesSection from '@/components/danphe/FeaturesSection';
import TestimonialsSection from '@/components/danphe/TestimonialsSection';
import TrustedSection from '@/components/danphe/TrustedSection';
import ContactSection from '@/components/danphe/ContactSection';
import SubscribeSection from '@/components/danphe/SubscribeSection';
import Footer from '@/components/danphe/Footer';
import ScrollToTop from '@/components/danphe/ScrollToTop';
import StickyContact from '@/components/danphe/StickyContact';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ValueSection />
        <ModuleSection />
        <OutcomesSection />
        <FeaturesSection />
        <TestimonialsSection />
        <TrustedSection />
        <ContactSection />
        <SubscribeSection />
      </main>
      <Footer className="mt-auto" />
      <ScrollToTop />
      <StickyContact />
    </div>
  );
}
