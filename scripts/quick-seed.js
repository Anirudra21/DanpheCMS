const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function main() {
  console.log('Running quick seed...');
  // Site settings singleton
  try {
    const existing = await db.siteSetting.findFirst();
    if (!existing) {
      await db.siteSetting.create({
        data: {
          logo: '/frontend/img/logo.png',
          email: 'info@danphehealth.com',
          phone: '+977-9852088004',
          facebookUrl: 'https://www.facebook.com/DapheHealth',
          instagramUrl: 'https://www.instagram.com/danphe_health/',
          address: 'Imark Digital Pvt. Ltd. Dillibazar, Kathmandu, Nepal',
          mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.32398903228!2d85.32684882524008!3d27.707281275494772!2d3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197f4baea3f5%3A0x55e4bb647cf623f8!2sImark%20Digital!5e0!3m2!1sen!2snp!4v1707112335014!5m2!1sen!2snp',
          footerText: 'www.danphecare.com / www.danphehealth.com',
          copyrightText: '© Copyright 2024. All Rights Reserved.',
        },
      });
      console.log('  Created siteSettings');
    } else {
      console.log('  siteSettings exists');
    }
  } catch (e) {
    console.error('siteSettings seed error', e.message || e);
  }

  // Nav items (minimal)
  try {
    const count = await db.navItem.count();
    if (count === 0) {
      const items = [
        { label: 'Company', url: '/company', order: 0, location: 'HEADER' },
        { label: 'Our Solution', url: '/solutions', order: 1, location: 'HEADER' },
        { label: 'Our Clients', url: '/clients', order: 2, location: 'HEADER' },
        { label: 'Contact Us', url: '/contact', order: 6, location: 'HEADER' },
      ];
      for (const it of items) await db.navItem.create({ data: it });
      console.log('  Created navItems');
    } else {
      console.log('  navItems exist');
    }
  } catch (e) {
    console.error('navItem seed error', e.message || e);
  }

  // Homepage sections
  try {
    const hsCount = await db.homepageSection.count();
    if (hsCount === 0) {
      const secs = [
        { key: 'hero', heading: 'Enterprise-Grade, Open-Source Hospital Management System', subheading: 'Complete HIMS with Integrated EMR & EHR — Trusted by 60+ Hospitals', order: 0 },
        { key: 'trusted', heading: 'Trusted by Leading Healthcare Institutions', order: 1 },
      ];
      for (const s of secs) await db.homepageSection.create({ data: s });
      console.log('  Created homepageSections');
    } else {
      console.log('  homepageSections exist');
    }
  } catch (e) {
    console.error('homepageSection seed error', e.message || e);
  }

  // Client logos (one)
  try {
    const cCount = await db.clientLogo.count();
    if (cCount === 0) {
      await db.clientLogo.create({ data: { name: 'Manipal College of Medical Science', logoUrl: '/storage/uploads/4IY4SO3BaLokN5TATWTijwqOSQvnAq880dX06swm.png', order: 0, showOnHomepage: true, isPublished: true } });
      console.log('  Created clientLogos');
    } else {
      console.log('  clientLogos exist');
    }
  } catch (e) {
    console.error('clientLogo seed error', e.message || e);
  }

  // Testimonials
  try {
    const tcount = await db.testimonial.count();
    if (tcount === 0) {
      await db.testimonial.create({ data: { authorName: 'Mark International Kidney Center', quote: 'MI Kidney Centre is focusing on spreading Dialysis services in different districts of Nepal.', imageUrl: '/storage/uploads/CvegKrVeoWfcXC7sMrXLVmB6Vj5ikChWIPZEln7d.png', order: 0, isPublished: true } });
      console.log('  Created testimonials');
    } else {
      console.log('  testimonials exist');
    }
  } catch (e) {
    console.error('testimonial seed error', e.message || e);
  }

  console.log('Quick seed complete');
}

main()
  .catch((e) => {
    console.error('Quick seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    try { await db.$disconnect(); } catch (e) {}
  });
