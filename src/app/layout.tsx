import type { Metadata } from 'next';
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Danphe Health - a complete solution for HIMS with EMR',
  description:
    'Danphe Health is a complete solution for HIMS with EMR, offering precision in healthcare information management',
  keywords:
    'Danphe Health, HIMS, healthcare information management system, Top HIMS system in Nepal, Complete HIMS Solution in Nepal, OPD management system in Nepal, Payroll management system in Nepal',
  authors: [{ name: 'Imark Digital Pvt. Ltd.' }],
  icons: {
    icon: 'https://danphehealth.com/admin/assets/media/logos/favicon.ico',
  },
  openGraph: {
    title: 'Danphe Health - a complete solution for HIMS with EMR',
    description:
      'Danphe Health is a complete solution for HIMS with EMR, offering precision in healthcare information management',
    url: 'https://danphehealth.com',
    siteName: 'Danphe Health',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Danphe Health - a complete solution for HIMS with EMR',
    description:
      'Danphe Health is a complete solution for HIMS with EMR, offering precision in healthcare information management',
    site: '@DanpheHealth',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
