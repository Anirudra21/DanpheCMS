import { getSiteSettings } from '@/lib/queries';
import ContactContent from './ContactContent';

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const siteSettings = {
    phone: settings?.phone || '',
    email: settings?.email || '',
    address: settings?.address || '',
    mapEmbedUrl: settings?.mapEmbedUrl || '',
  };

  return <ContactContent siteSettings={siteSettings} />;
}
