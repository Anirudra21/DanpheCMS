import { getHomepageSections } from '@/lib/queries';
import FAQSection from '@/components/danphe/FAQSection';

export default async function FAQsPage() {
  const sections = await getHomepageSections();
  const faqsSection = sections.find((s) => s.key === 'faqs');

  const faqs = (faqsSection?.body ?? '')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|');
      return {
        question: parts[0] || '',
        answer: parts[1] || '',
      };
    });

  return (
    <FAQSection
      heading={faqsSection?.heading || 'Frequently Asked Questions'}
      subheading={faqsSection?.subheading || 'Find answers to common questions about DANPHE.'}
      faqs={faqs}
    />
  );
}
