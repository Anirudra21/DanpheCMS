import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  datasources: {
    db: { url: 'file:/home/z/my-project/db/custom.db' },
  },
});

async function main() {
  console.log('🌱 Seeding content into database...');

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. SiteSettings (singleton — upsert)
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding SiteSettings...');
  const existing = await db.siteSetting.findFirst();
  if (existing) {
    await db.siteSetting.update({
      where: { id: existing.id },
      data: {
        logo: 'https://danphehealth.com/frontend/img/logo.png',
        email: 'info@danphehealth.com',
        phone: '+977-9852088004',
        facebookUrl: 'https://www.facebook.com/DapheHealth',
        instagramUrl: 'https://www.instagram.com/danphe_health/',
        address: 'Imark Digital Pvt. Ltd. Dillibazar, Kathmandu, Nepal',
        mapEmbedUrl:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.32398903228!2d85.32684882524008!3d27.707281275494772!2d3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197f4baea3f5%3A0x55e4bb647cf623f8!2sImark%20Digital!5e0!3m2!1sen!2snp!4v1707112335014!5m2!1sen!2snp',
        footerText: 'www.danphecare.com / www.danphehealth.com',
        copyrightText: '© Copyright 2024. All Rights Reserved.',
      },
    });
    console.log('  ✅ SiteSettings updated');
  } else {
    await db.siteSetting.create({
      data: {
        logo: 'https://danphehealth.com/frontend/img/logo.png',
        email: 'info@danphehealth.com',
        phone: '+977-9852088004',
        facebookUrl: 'https://www.facebook.com/DapheHealth',
        instagramUrl: 'https://www.instagram.com/danphe_health/',
        address: 'Imark Digital Pvt. Ltd. Dillibazar, Kathmandu, Nepal',
        mapEmbedUrl:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.32398903228!2d85.32684882524008!3d27.707281275494772!2d3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197f4baea3f5%3A0x55e4bb647cf623f8!2sImark%20Digital!5e0!3m2!1sen!2snp!4v1707112335014!5m2!1sen!2snp',
        footerText: 'www.danphecare.com / www.danphehealth.com',
        copyrightText: '© Copyright 2024. All Rights Reserved.',
      },
    });
    console.log('  ✅ SiteSettings created');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. NavItems
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding NavItems...');
  await db.navItem.deleteMany();
  console.log('  Cleared existing NavItems');

  const navItems = [
    // HEADER (order 0-6)
    { label: 'Company', url: '/company', order: 0, location: 'HEADER' as const },
    { label: 'Our Solution', url: '/solutions', order: 1, location: 'HEADER' as const },
    { label: 'Our Clients', url: '/clients', order: 2, location: 'HEADER' as const },
    { label: 'News & Events', url: '/news-events', order: 3, location: 'HEADER' as const },
    { label: 'Career', url: '/careers', order: 4, location: 'HEADER' as const },
    { label: 'Danphe Community', url: '/danphe-community', order: 5, location: 'HEADER' as const },
    { label: 'Contact Us', url: '/contact', order: 6, location: 'HEADER' as const },

    // FOOTER_COMPANY (order 0-4)
    { label: 'Company', url: '/company', order: 0, location: 'FOOTER_COMPANY' as const },
    { label: 'Our Clients', url: '/clients', order: 1, location: 'FOOTER_COMPANY' as const },
    { label: 'Career', url: '/careers', order: 2, location: 'FOOTER_COMPANY' as const },
    { label: 'News & Events', url: '/news-events', order: 3, location: 'FOOTER_COMPANY' as const },
    { label: 'Contact Us', url: '/contact', order: 4, location: 'FOOTER_COMPANY' as const },

    // FOOTER_SOLUTIONS (order 0-3)
    {
      label: 'Patient Management',
      url: '/solution/patient-administration',
      order: 0,
      location: 'FOOTER_SOLUTIONS' as const,
    },
    {
      label: 'Materials (goods) Management',
      url: '/solution/inventory-management',
      order: 1,
      location: 'FOOTER_SOLUTIONS' as const,
    },
    { label: 'Revenue Management', url: '/solutions', order: 2, location: 'FOOTER_SOLUTIONS' as const },
    {
      label: 'Hospital Employee Management (HR Management)',
      url: '/solutions',
      order: 3,
      location: 'FOOTER_SOLUTIONS' as const,
    },

    // FOOTER_INFO (order 0-2)
    { label: 'FAQs', url: '/faqs', order: 0, location: 'FOOTER_INFO' as const },
    { label: 'Privacy Policy', url: '/privacy-policy', order: 1, location: 'FOOTER_INFO' as const },
    { label: 'Terms & Conditions', url: '/terms-and-conditions', order: 2, location: 'FOOTER_INFO' as const },
  ];

  for (const item of navItems) {
    await db.navItem.create({ data: item });
  }
  console.log(`  ✅ Created ${navItems.length} NavItems`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. Solutions + SolutionFeatures
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding Solutions & Features...');
  await db.solutionFeature.deleteMany();
  await db.solution.deleteMany();
  console.log('  Cleared existing Solutions and Features');

  const solutions = [
    {
      title: 'Patient Administration',
      slug: 'patient-administration',
      shortDescription:
        'Enhancing Patient Care and Staff Incentives',
      body: 'This system assists patients in scheduling appointments online, as well as registering walk-in patients. It facilitates the collection of demographic, insurance, and other essential information related to patients for treatment. It also incorporates billing for outpatient, inpatient, and discharge services, among others. The incentive module deals with calculating and managing incentives for hospital staff, including doctors, nurses, and other staff members. It involves features such as defining incentive plans, tracking performance, and calculating incentives.',
      iconUrl: 'https://danphehealth.com/storage/uploads/o8LhlIHosonN1ss1Xbnx4BuPQIH2j5kTJLsqkWUF.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/B06yY9y2MQiUCBEHpIcSITBjuN4yhkH4mLGvejX0.jpg',
      order: 0,
      isPublished: true,
      features: [
        'Online/ Phone/ Physical appointments',
        'General information of patients',
        'Follow-up patient management',
        'Doctor/ Department management',
        'Referral management (third party referral)',
        'Referral management (inter-departmental)',
        'Tests items, billing items and other services billing management',
        'Health package billing management',
        'Membership and schemes management',
        'Zero price item-wise billing',
        'Referred by, Prescriber and Performer auto captured',
        'Dr. Fraction configuration',
        'Multi-Level Auto fraction setups and captures',
        'Payment management with account integration',
      ],
    },
    {
      title: 'OPD Management',
      slug: 'opd-management',
      shortDescription:
        'In Person OPD Management',
      body: 'An organized OPD is crucial for managing a large number of patients attended by multiple doctors. The complete cycle of an effective OPD, from registration through patient history, diagnosis, and prescriptions, is efficiently stored and managed by DANPHE Software. The system enhances functionality with health insurance and SSF tracking, alongside the integration of ICDX codes. It boasts powerful reporting capabilities, enabling the scanning and storage of comprehensive patient demographics, including X-rays, ultrasound images, pathology reports, and other diagnostic documents.',
      iconUrl: 'https://danphehealth.com/storage/uploads/1FLzrtg52EKgMbKXaPPcngIBl8ThbVT5f93VKn5U.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/3BiXFrnlBFMoMRwWZkoNm4XuMbUw1kNJgDkGIYdo.jpg',
      order: 1,
      isPublished: true,
      features: [
        'OPD Appointments',
        'OPD Registration',
        'OPD Charges',
        'Medical Observation',
        'Consultant wise OPD',
        'Case wise/ Department wise OPD',
        'Procedure and clinical services requests',
        'LAB service request',
        'Pharmacy service request',
      ],
    },
    {
      title: 'IPD Management',
      slug: 'ipd-management',
      shortDescription:
        'The Comprehensive Inpatient Management Solution',
      body: "The Complete Inpatient Management Module efficiently handles all inpatient functionalities in your hospital, from patient registration to billing, along with comprehensive tracking of patient records. Featuring built-in ward management and nursing station management, as well as ICU and NICU availability, the IPD offers a 360-degree view of the entire admitted patient's journey from admission to discharge.",
      iconUrl: 'https://danphehealth.com/storage/uploads/JZb6vJSIzCQZjvPUKBy1ds3KmAL8FMlvVL1XhtV7.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/91ujO9IGH8LC6R1nc1fwwGeEiLrNIJQMSDegvElw.jpg',
      order: 2,
      isPublished: true,
      features: [
        'Wards, Floor, Room & Bed Configuration',
        'Bed occupation status',
        'Admission and bed allocation (live)',
        'Payment receipts',
        'Medical observation and Nursing notes',
        'LAB & Radiology Investigation requests',
        'Procedure and clinical services requests',
        'Patient payment and dues reports',
      ],
    },
    {
      title: 'OT Management',
      slug: 'ot-management',
      shortDescription:
        'Innovations in Operation Theater Management',
      body: 'The Operation Theater module facilitates the scheduling of operation theaters, surgical teams, patient tracking, operation theater rosters, and notes, along with managing death and birth certificates. The purpose of OT management is to optimize the utilization of operation theaters, reduce patient wait times, and ensure timely and efficient surgical procedures.',
      iconUrl: 'https://danphehealth.com/storage/uploads/CACHu7gc6zeiiyuUvDBzfZIn2tBT51gzsKA0wpLj.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/bBYlK3VeJuVsh9FG2yR6gS2Y11p3dUJmWPNmE7nX.jpg',
      order: 3,
      isPublished: true,
      features: [
        'OT Scheduling of the patient',
        'Team of Doctors/ Assistance involved in the operations',
        'Consent forms',
        "OT Reporting's",
        'Birth/ Death Certificates',
      ],
    },
    {
      title: 'SSF Management',
      slug: 'ssf-management',
      shortDescription:
        'SSF Insurance Scheme Management Module for Hospitals',
      body: 'This module aids in managing the Social Security Fund (SSF) insurance scheme in hospitals. It supports registration, billing, pharmacy, and claim management and is equipped with API integration with the SSF system.',
      iconUrl: 'https://danphehealth.com/storage/uploads/aSIoLyT5ERWOjXCnvgrP9PKL5797LBQc2MQY0lim.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/qFoZIpGXbbatD2dCVlfzh7RqWhUuOx9t3Dl5pQpA.jpg',
      order: 4,
      isPublished: true,
      features: [
        'SSF rate list mapping with hospital item lists',
        'Eligibility mapping of the SSF patient via API',
        'Balance sync and update as per SSF',
        'Claim booking in SSF',
        'Claim submission',
        'Copayment management',
        'Integration with accounting module so as to book the sales etc.',
      ],
    },
    {
      title: 'Pathology Software',
      slug: 'pathology-software',
      shortDescription:
        'Automating Processes and Enhancing Efficiency',
      body: 'The Pathology Lab Management module facilitates the definition of laboratory tests, supporting fully configurable laboratory test reports that can be ordered for both outpatients and inpatients instantaneously.',
      iconUrl: 'https://danphehealth.com/storage/uploads/KFsFp99lsTgyXnVKJbiUi7gCRmRp2NR1umxVb19S.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/PsJBHIIIEf0rhUAtYiK14G1fZx0lB76ZKIr90GS2.jpg',
      order: 5,
      isPublished: true,
      features: [
        'Receive investigation request from OP/IP department',
        'Receipt printing',
        'Investigation sample collection',
        'Patient and test sticker printing',
        'Integration with patient billing system',
        'Generate investigation reports',
        'Warning and alerts for abnormal reports',
        'Report output to PDF',
        'Report validation before dispatch',
      ],
    },
    {
      title: 'Pharmacy',
      slug: 'pharmacy',
      shortDescription:
        'Optimizing Workflow and Administration',
      body: 'The pharmacy module encompasses both central and distributed pharmacies, incorporating several functional units such as stock tracking, ordering, and receiving medicines from vendors.',
      iconUrl: 'https://danphehealth.com/storage/uploads/lBnFUPj2tIcbTR3o0nL771yPqyvn9iy538SOfRrH.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/toh9opS0qNh9sYaC0VLqXpjHSYnJUrfowh50Ogkh.jpg',
      order: 6,
      isPublished: true,
      features: [
        'Purchase and orders',
        'Good receipt notes/ Purchase returns',
        'Drugs/ Medical supplies to patients and wards',
        'Batch and expiry management',
        'Fast moving/ Nonmoving drugs',
        'Stock transfer between sub-stores',
        'Stock re-order reports',
        'Drug stocks',
        'Supplies outstanding etc.',
      ],
    },
    {
      title: 'Inventory Management',
      slug: 'inventory-management',
      shortDescription:
        'Streamlined Inventory Control',
      body: 'The inventory module spans across the entire hospital, encompassing wards, OT, pharmacy, and other departments, regulating the complete stock movement throughout the institution.',
      iconUrl: 'https://danphehealth.com/storage/uploads/Yn3oJlVoSPd36iYdBg85CBZADxQrdi5TjpDPepKe.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/MQfWurB0r1HXok9nRVNTJ0B4iNaxVgI7XMhyNJ6g.jpg',
      order: 7,
      isPublished: true,
      features: [
        'Purchase Indents & Approval',
        'Quotation & Follow-ups',
        'PO generation',
        'Goods receipts',
        'Purchase invoicing and returns',
        'Goods issue to different department',
        'Stock reorder management',
        'Suppliers outstanding',
        'Financial posting to account section',
      ],
    },
    {
      title: 'Queue Management',
      slug: 'queue-management',
      shortDescription:
        'Efficient Patient Flow Management',
      body: 'The queue management feature in DANPHE HIMS is utilized to manage patient queues and prioritize patient flow within the hospital. It ensures that patients are attended to promptly and efficiently, thereby reducing waiting times and enhancing patient satisfaction.',
      iconUrl: 'https://danphehealth.com/storage/uploads/3ifn90GrhvLTmH9h79XwY4ebCxajfC8ivC1JHe3L.svg',
      heroImageUrl: 'https://danphehealth.com/storage/uploads/nlWH1aOywuLS90YcmM2ZCMZrYkB7xv9eFNtulLV0.jpg',
      order: 8,
      isPublished: true,
      features: [
        'Queue display',
        'Appointment scheduling with token number',
        'Patient tracking with status',
        'Patient check-in',
      ],
    },
  ];

  for (const sol of solutions) {
    const { features, ...solutionData } = sol;
    const created = await db.solution.create({ data: solutionData });
    for (let i = 0; i < features.length; i++) {
      await db.solutionFeature.create({
        data: {
          label: features[i],
          order: i,
          solutionId: created.id,
        },
      });
    }
  }
  console.log(`  ✅ Created ${solutions.length} Solutions with features`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. Stats
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding Stats...');
  await db.stat.deleteMany();
  console.log('  Cleared existing Stats');

  const stats = [
    { label: 'Hospitals', value: '60', suffix: '+', order: 0 },
    { label: 'Integrated Modules', value: '9', suffix: '+', order: 1 },
    { label: 'Web-Based', value: '100', suffix: '%', order: 2 },
    { label: 'Support', value: '24', suffix: '/7', order: 3 },
    { label: 'Years of Experience', value: '15', suffix: '+', order: 4 },
    { label: 'Hospitals and Clinics', value: '55', suffix: '+', order: 5 },
    { label: 'Employees', value: '130', suffix: '+', order: 6 },
    { label: 'HIMS Modules', value: '30', suffix: '+', order: 7 },
  ];

  for (const stat of stats) {
    await db.stat.create({ data: stat });
  }
  console.log(`  ✅ Created ${stats.length} Stats`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. TeamMembers
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding TeamMembers...');
  await db.teamMember.deleteMany();
  console.log('  Cleared existing TeamMembers');

  const teamMembers = [
    {
      name: 'Ram P. Dhungana',
      title: 'Chairman',
      photoUrl: '/team/ram-dhungana.jpg',
      order: 0,
      isPublished: true,
    },
    {
      name: 'Dr Prabhat Adhikari, MD',
      title: 'Co-Founder and\nClinical Director',
      photoUrl: '/team/prabhat-adhikari.jpg',
      order: 1,
      isPublished: true,
    },
    {
      name: 'Shiv P Koirala',
      title: 'Co-Founder and\nTechnical Director',
      photoUrl: '/team/shiv-koirala.jpg',
      order: 2,
      isPublished: true,
    },
    {
      name: 'Dr.Binod Dhungana, MD, MBA',
      title: 'Co-founder and Director',
      photoUrl: '/team/binod-dhungana.jpg',
      order: 3,
      isPublished: true,
    },
  ];

  for (const member of teamMembers) {
    await db.teamMember.create({ data: member });
  }
  console.log(`  ✅ Created ${teamMembers.length} TeamMembers`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. Testimonials
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding Testimonials...');
  await db.testimonial.deleteMany();
  console.log('  Cleared existing Testimonials');

  const testimonials = [
    {
      authorName: 'Mark International Kidney Center',
      quote:
        'MI Kidney Centre is focusing on spreading Dialysis services in different districts of Nepal, prioritizing rural cities with frequent screening and awareness programs for Kidney diseases.',
      imageUrl: 'https://danphehealth.com/storage/uploads/CvegKrVeoWfcXC7sMrXLVmB6Vj5ikChWIPZEln7d.png',
      order: 0,
      isPublished: true,
    },
    {
      authorName: 'Buddhanilkantha Healthcare Pvt. Ltd.',
      quote:
        'A team of doctors committed to providing affordable and high-quality basic medical services believes in preventing and reducing illness within an affordable setup.',
      imageUrl: 'https://danphehealth.com/storage/uploads/WJhqEGEa3RoG8kMO0vitnHKhk5L3LDixj72dxwfm.png',
      order: 1,
      isPublished: true,
    },
    {
      authorName: 'Charak Hospital Pvt. Ltd.',
      quote:
        'Charak Memorial Hospital strives for excellence in quality, hygiene, and technology, meeting public health needs in the Western Region through innovation and cost-effective solutions.',
      imageUrl: 'https://danphehealth.com/storage/uploads/s6mv48ri5hDrXDxgzU3E1lIW8qRj9TUrV69b5hQc.jpg',
      order: 2,
      isPublished: true,
    },
    {
      authorName: 'Maya Metro Hospital pvt. Ltd.',
      quote:
        'MMTH, part of NEHCO, champions equitable healthcare and quality education through collaborative efforts.',
      imageUrl: 'https://danphehealth.com/storage/uploads/WQEEaXp58AGxNO61rv0xqypPC4KpMhnvpJb2Q01c.png',
      order: 3,
      isPublished: true,
    },
    {
      authorName: 'Manmohan Hospital',
      quote:
        'This hospital plays a vital role related to health issues and their solution in the far west development region in Nepal, with great experience and an expert doctors team.',
      imageUrl: 'https://danphehealth.com/storage/uploads/IHeII9hv0UFpBpwTLouWfOOnGMWDtNaFIbmnQZg1.jpg',
      order: 4,
      isPublished: true,
    },
  ];

  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }
  console.log(`  ✅ Created ${testimonials.length} Testimonials`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. ClientLogos
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding ClientLogos...');
  await db.clientLogo.deleteMany();
  console.log('  Cleared existing ClientLogos');

  // The 12 TRUSTED_HOSPITALS that appear on the homepage
  const homepageClients = new Set([
    'Manipal College of Medical Science',
    'Tilganga Institute of Ophthalmology (Tilganga)',
    'APF (Armed Police Force) Hospital',
    'Siddhartha Nagar City Hospital Pvt.Ltd.',
    'Charak Hospital Pvt. Ltd.',
    'Fishtail Hospital Pvt. Ltd.',
    'Manakamana Hospital Pvt. Ltd.',
    'Maya Metro Hospital pvt. Ltd.',
    'Neuro Cardio Hospital',
    'Manmohan Hospital',
    'Lumbini Provincial Hospital',
    'SGM Hospital Pvt. Ltd',
  ]);

  const clientLogos = [
    { name: 'Mark International Kidney Center', logoUrl: 'https://danphehealth.com/storage/uploads/CvegKrVeoWfcXC7sMrXLVmB6Vj5ikChWIPZEln7d.png', order: 0 },
    { name: 'National Trauma Center (NAMS)', logoUrl: 'https://danphehealth.com/storage/uploads/o5Zhgt2GGub5BUNAydXVUlUETvmRXeGEIvEriLYl.png', order: 1 },
    { name: 'Manipal College of Medical Science', logoUrl: 'https://danphehealth.com/storage/uploads/4IY4SO3BaLokN5TATWTijwqOSQvnAq880dX06swm.png', order: 2 },
    { name: 'Tilganga Institute of Ophthalmology (Tilganga)', logoUrl: 'https://danphehealth.com/storage/uploads/YRlPFHdotC4yL6OpPwfpJi6W0S8G0kcPNNmvL5JG.png', order: 3 },
    { name: 'APF (Armed Police Force) Hospital', logoUrl: 'https://danphehealth.com/storage/uploads/LvNtx7mQtJlbz9ycPe8pQZVoPzLBiFsuMyfRY1Pr.png', order: 4 },
    { name: 'Hope International College & Hospital Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/fUyQ04tj66mbgHu2q9oWf7BX8O7CXvP1keYHTx6r.png', order: 5 },
    { name: 'Center for American Medical Specialists (CAMS)', logoUrl: 'https://danphehealth.com/storage/uploads/RqdskDldRTpgBYg5sUUu0OkcmNuBw9QwFK6KKG7e.png', order: 6 },
    { name: 'Anamiwa Health & Wellness Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/zNwWDfrw7lORANZr3TVsvRIl4TNt9okcwnV0VyJd.png', order: 7 },
    { name: 'We care Health Center Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/mrp9fZCqpE7RB9QtJPcaqCtF9D7xPuwW1PdAEYem.png', order: 8 },
    { name: 'Buddhanilkantha Healthcare Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/WJhqEGEa3RoG8kMO0vitnHKhk5L3LDixj72dxwfm.png', order: 9 },
    { name: 'DanpheCare Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/iT0rlozWMUr6cep6wMmTncN7B6RUaU6YzntOUzC7.png', order: 10 },
    { name: 'J & J Hospital', logoUrl: 'https://danphehealth.com/storage/uploads/NGs58eWiZYX8ugT3PgCYYSvIXGWDR0WuhaeYCdql.png', order: 11 },
    { name: 'Path Minds Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/FKitStuvautdQFj0B3RhWI38ThpL4wmjDnE5oQTk.png', order: 12 },
    { name: 'Siddhartha Nagar City Hospital Pvt.Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/dpOuibvB4foJdzuMpROb1Xaduko2KPZ8h5sof1Nz.png', order: 13 },
    { name: 'United Hospital Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/UY5Nl1ge0eh2V1131Jui5X3yM7p1bcMr1bL8rxh8.png', order: 14 },
    { name: 'Charak Hospital Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/s6mv48ri5hDrXDxgzU3E1lIW8qRj9TUrV69b5hQc.jpg', order: 15 },
    { name: 'Fishtail Hospital Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/rqjKdONW5AKP4sX49m4IIgKAx8zo4I6qm9pHLIdw.png', order: 16 },
    { name: 'Medi Plus Hospital Pvt. Ltd.', logoUrl: '', order: 17 },
    { name: 'Padma Nursing Home Pvt. Ltd.', logoUrl: '', order: 18 },
    { name: 'Kaligandaki Diagnostic and Research Center Hospital', logoUrl: '', order: 19 },
    { name: 'Deep Hospital & Research Center Pvt. Ltd.', logoUrl: '', order: 20 },
    { name: 'Manakamana Hospital Pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/DvtgZd0LZopNWutTMb8AYZ7AnQRKHH4ROmN7zCIw.png', order: 21 },
    { name: 'Koshish Cancer Center Pvt. Ltd.', logoUrl: '', order: 22 },
    { name: 'National City Hospital Pvt. Ltd.', logoUrl: '', order: 23 },
    { name: 'Raskot Community Hospital', logoUrl: '', order: 24 },
    { name: 'Bhaktapur International Hospital Pvt.Ltd.', logoUrl: '', order: 25 },
    { name: 'Clinic One', logoUrl: '', order: 26 },
    { name: 'Rhythm Neuropsychiatry Hospital & Research Center Pvt. Ltd.', logoUrl: '', order: 27 },
    { name: 'Maya Metro Hospital pvt. Ltd.', logoUrl: 'https://danphehealth.com/storage/uploads/WQEEaXp58AGxNO61rv0xqypPC4KpMhnvpJb2Q01c.png', order: 28 },
    { name: 'Radiant Skin Care Pvt. Ltd.', logoUrl: '', order: 29 },
    { name: 'Dr. Iwamura Hospital', logoUrl: '', order: 30 },
    { name: "Dr. Priyanka's Clinic", logoUrl: '', order: 31 },
    { name: 'Tillottama Hospital', logoUrl: '', order: 32 },
    { name: 'Butwal Hospital', logoUrl: '', order: 33 },
    { name: 'Times Care Hospital', logoUrl: '', order: 34 },
    { name: 'Neuro Cardio Hospital', logoUrl: 'https://danphehealth.com/storage/uploads/PSjGCpwlgqK620FI8qTz4h6vkUvexhNIq0iQUvEz.png', order: 35 },
    { name: 'Manmohan Hospital', logoUrl: 'https://danphehealth.com/storage/uploads/IHeII9hv0UFpBpwTLouWfOOnGMWDtNaFIbmnQZg1.jpg', order: 36 },
    { name: 'Ministry of Social Development and Health, Gandaki Province', logoUrl: '', order: 37 },
    { name: 'Lumbini Provincial Hospital', logoUrl: 'https://danphehealth.com/storage/uploads/XwKrcFgg8NzD5hs58C8dz91oiCFZ0MnLJNKoqdaQ.png', order: 38 },
    { name: 'SGM Hospital Pvt. Ltd', logoUrl: 'https://danphehealth.com/storage/uploads/roKTGWaMI1ZvCpKyogTJV22ri3QYifaTXylgCdcC.png', order: 39 },
    { name: 'Annapurna Neuro Hospital', logoUrl: '', order: 40 },
    { name: 'Bhagiratha Buddhashanti Hospital', logoUrl: '', order: 41 },
    { name: 'Gorkha Kalika Hospital Pvt.Ltd.', logoUrl: '', order: 42 },
    { name: 'Star Hospital Limited', logoUrl: '', order: 43 },
    { name: 'Matrika Eye Center', logoUrl: '', order: 44 },
    { name: 'Tilottama Hospital Pvt. Ltd.', logoUrl: '', order: 45 },
    { name: 'Sudur Paschim International Dialysis Center', logoUrl: '', order: 46 },
  ];

  for (const cl of clientLogos) {
    await db.clientLogo.create({
      data: {
        name: cl.name,
        logoUrl: cl.logoUrl,
        order: cl.order,
        showOnHomepage: homepageClients.has(cl.name),
        isPublished: true,
      },
    });
  }
  console.log(`  ✅ Created ${clientLogos.length} ClientLogos`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. Posts (NEWS_EVENT type)
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding Posts (NEWS_EVENT)...');
  await db.post.deleteMany({ where: { type: 'NEWS_EVENT' } });
  console.log('  Cleared existing NEWS_EVENT Posts');

  const posts = [
    {
      title: '2023 Recap of AI developments',
      slug: '2023-recap-ai-developments',
      coverImageUrl:
        'https://danphehealth.com/storage/uploads/qJC8UWbueNgrVxOUzwXyz4vAXQi9zxmNFD2dBWU9.png',
      author: 'Digwatch',
      publishedAt: new Date('2024-01-03'),
      excerpt:
        "In the swiftly evolving landscape of the artificial intelligence technology, returning to the incipit of this revolutionary invention's precise moment of origin is complex. However, in the third decade of the 20th century, the earliest materialisation of such ideas and concepts occurred in literature.",
      type: 'NEWS_EVENT' as const,
      status: 'PUBLISHED' as const,
    },
    {
      title:
        'Navigating the Healthcare Landscape: A Comprehensive Guide to HIPAA Compliance in Hospitals.',
      slug: 'hipaa-compliance-hospitals',
      coverImageUrl:
        'https://danphehealth.com/storage/uploads/UCplaL4d4WzJAv9ZxgqTOUIpvHGjL2ZPj6jOnDdf.jpg',
      author: 'Danphe Health',
      publishedAt: new Date('2024-01-08'),
      excerpt:
        'In the ever-evolving realm of healthcare, safeguarding patient information is of paramount importance. The Health Insurance Portability and Accountability Act (HIPAA) plays a central role in ensuring the confidentiality, integrity, and availability of patient data.',
      type: 'NEWS_EVENT' as const,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'How do electronic health records (EHR or EMR) make healthcare better?',
      slug: 'ehr-emr-healthcare-better',
      coverImageUrl:
        'https://danphehealth.com/storage/uploads/h2HDNsv5bp2mI8WG9xv7spFXiQFhIWlr2hUMHLG5.jpg',
      author: 'Eduhealth System',
      publishedAt: new Date('2023-02-17'),
      excerpt:
        'There is a growing interest in EHRs around the world. Technology and innovations are changing the health industry, governments and organizations are focusing on providing better health services to the public.',
      type: 'NEWS_EVENT' as const,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Importance of Electronic Health Records in Nursing',
      slug: 'ehr-importance-nursing',
      coverImageUrl:
        'https://danphehealth.com/storage/uploads/an0lprVHccGkqUYrQk6A3spAlUjZWuVMB7E1gUo0.jpg',
      author: 'Regis College',
      publishedAt: new Date('2023-05-04'),
      excerpt:
        'In 2009, only 12% of hospitals used EHRs, according to the Office of the National Coordinator for Health Information Technology. By 2021 — thanks in part to $27 billion in financial incentives from Congress — EHRs were almost universal, with 96% of hospitals adopting them.',
      type: 'NEWS_EVENT' as const,
      status: 'PUBLISHED' as const,
    },
  ];

  for (const post of posts) {
    await db.post.create({ data: post });
  }
  console.log(`  ✅ Created ${posts.length} Posts`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. HomepageSections
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding HomepageSections...');
  await db.homepageSection.deleteMany();
  console.log('  Cleared existing HomepageSections');

  const homepageSections = [
    {
      key: 'hero',
      heading: 'Enterprise-Grade, Open-Source Hospital Management System',
      subheading: 'Complete HIMS with Integrated EMR & EHR — Trusted by 60+ Hospitals',
      body: '',
      image: '',
      ctaLabel: 'Schedule a Demo',
      ctaUrl: '/schedule-a-demo',
      order: 0,
    },
    {
      key: 'trusted',
      heading: 'Trusted by Leading Healthcare Institutions',
      subheading: '',
      body: '',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 1,
    },
    {
      key: 'value_adds',
      heading: 'What values DANPHE can ADD to your business',
      subheading: '',
      body: "Helping our customer to take lead in their business using Information Technology\nTime tested products to increase customer operational efficiency immediately\nAvailability of information's in right product will help in right decision making",
      image: 'https://danphehealth.com/frontend/img/about-img.png',
      ctaLabel: 'Schedule a Demo',
      ctaUrl: '/schedule-a-demo',
      order: 2,
    },
    {
      key: 'outcomes',
      heading: 'Delivering better outcomes by working together to build smart system solutions for you',
      subheading: '',
      body: 'Improve your patient experience by improving your process with DANPHE HMIS Software\nSignificant reduction in time and effort required to manage your Health Institution',
      image: 'https://danphehealth.com/frontend/img/doctor.png',
      ctaLabel: 'Explore More',
      ctaUrl: '/solutions',
      order: 3,
    },
    {
      key: 'features_row',
      heading: 'We Provide Trusted and Best Software',
      subheading: 'All-in-one hospital management solution for seamless operations',
      body: 'Built By Doctors For Doctors|We have your efficiency and ease in mind, so we have developed an user-friendly solution.|Stethoscope\nCustomizable & Scalable|We built it from the bottom up, so we can customize to your needs. Also, as your business grows, Danphe can scale to meet your demands|Settings\nCloudbase Service|We offer both on premises and cloud based services catering to your needs.|Cloud',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 4,
    },
    {
      key: 'comparison',
      heading: 'Why Healthcare Institutions Choose DANPHE',
      subheading: 'The only HMIS built by doctors, for doctors — with the flexibility of open source.',
      body: 'Built by Healthcare Professionals|Developed with deep domain expertise from doctors and hospital administrators who understand real clinical workflows.\nProven in Production|Battle-tested across 60+ hospitals handling millions of patient records, billing cycles, and clinical workflows daily.\nOpen-Source Freedom|Full access to source code. No vendor lock-in. Customize, extend, and integrate DANPHE to fit your exact hospital requirements.',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 5,
    },
    {
      key: 'opensource',
      heading: 'Why Open-Source HMIS?',
      subheading: 'Transparency, flexibility, and community-driven innovation — the foundation of trustworthy healthcare software.',
      body: 'Full Transparency|Review, audit, and verify every line of code. Complete visibility into how your patient data is handled.\nNo Vendor Lock-in|Own your data and infrastructure. Migrate, customize, and extend without restrictions.\nCommunity Driven|Benefit from contributions, bug fixes, and feature requests from a global community of healthcare technology professionals.\nCost Effective|Eliminate expensive licensing fees. Open-source means lower total cost of ownership with enterprise-grade capabilities.',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 6,
    },
    {
      key: 'technology',
      heading: 'Built on Modern Technology',
      subheading: 'Designed for reliability, scalability, and performance in mission-critical healthcare environments.',
      body: '100% Web-Based|Access your hospital management system from any device with a modern web browser. No installations, no compatibility issues — just seamless access from anywhere.\nScalable Architecture|From small clinics to large multi-specialty hospitals, Danphe scales with your organization. Handle increasing patient volumes and complex workflows effortlessly.\nSecure by Design|Built with security best practices including role-based access, audit trails, and data encryption to protect sensitive patient information.',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 7,
    },
    {
      key: 'international',
      heading: 'Trusted Across Borders',
      subheading: 'From Kathmandu to the far west — Danphe HMIS serves healthcare institutions across diverse geographies.',
      body: '',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 8,
    },
    {
      key: 'testimonials',
      heading: 'See what our valuable clients tell about us',
      subheading: "Trusted by leading healthcare institutions across Nepal, our clients share their experiences working with Danphe Health's hospital management system.",
      body: '',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 9,
    },
    {
      key: 'faqs',
      heading: 'Frequently Asked Questions',
      subheading: 'Everything you need to know about DANPHE HMIS',
      body: `Why DANPHE is different from other available in the market|DANPHE-HMIS with EMR by Imark Digital has been offered to customers for many years, providing advantages in managing business processes more effectively. DANPHE is a 100% web-based HMIS solution available in the market with trust. Unlike other HMIS systems on the market that offer inadequate solutions to meet hospital needs, DANPHE from Imark Digital is capable of controlling inventory, purchase orders, entry planning, accounting, human resource management, and clinical management solutions.
What are the security aspects of DANPHE?|As we have been in the market for many years, we have always prioritized security. It has been proven that DANPHE HMIS is fully secure from various unexpected technical intrusions. The software provides valuable ways to protect the centralized database and facilitates access for relevant departments or units with accurate permissions. The database in the system is secured in several ways: Access to the system is restricted to only two entities: the admin and individuals with legal authority (user-based permissions and controls). Software and module logins are effectively password protected. All passwords are individually generated. For security reasons, these passwords need to be changed at regular intervals.
Is it true that extremely less time is required to implement DANPHE HMIS?|DANPHE follows a phased-based implementation modality that facilitates timely and cost-effective service. We assert that DANPHE HMIS implementation is faster and more reliable compared to others. We provide a guarantee to our respected clients that their proposed software will go live according to defined protocols and within defined time frames.
Is DANPHE HMIS suitable for all small to big healthcare institution?|This is an extremely deep and important question that has been asked many times by most growing industry verticals. Well, don't worry about business size or scale, DANPHE is capable enough to easily get fitted in any size or type of healthcare institution, may it be a small nursing home, a medium-sized hospital, or a large multi-specialty tertiary care center.
Is it possible to transfer the entire existing data to the newly implemented DANPHE System?|Yes, of course. Data migration is feasible in DANPHE, which is a plus point with our latest DANPHE product. In some cases and modules, the facility may not be available as per the rules of the governing body.
Does Imark Digital offer after sales support services for DANPHE HMIS System?|In case of any inconvenience regarding software operation or implementation, our technical executives are here to resolve all system-related issues and hassles. We have a dedicated team of support engineers assigned to each hospital to take care of their needs.`,
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 10,
    },
    {
      key: 'subscribe',
      heading: 'Subscribe for a Transformative Demo of Our Cutting-Edge Solutions!',
      subheading:
        'Subscribe now for a personalized demo and unlock the future with innovative solutions tailored to enhance efficiency and elevate your overall experience.',
      body: '',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 11,
    },
    {
      key: 'contact',
      heading: 'Let us know how we can help you.',
      subheading: 'You can send an email to info@danphehealth.com',
      body: '',
      image: '',
      ctaLabel: '',
      ctaUrl: '',
      order: 12,
    },
  ];

  for (const section of homepageSections) {
    await db.homepageSection.create({ data: section });
  }
  console.log(`  ✅ Created ${homepageSections.length} HomepageSections`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 10. Globe Countries (Trusted Across Borders) ──────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Seeding GlobeCountries...');
  const existingGlobeCountries = await db.globeCountry.count();
  if (existingGlobeCountries > 0) {
    console.log(`  ⏭️  GlobeCountries already exist (${existingGlobeCountries}), skipping`);
  } else {
    const globeCountries = [
      { countryName: 'Nepal', latitude: 28.3949, longitude: 84.124, hospitalCount: 60, displayLabel: '60+ Hospitals', isHighlighted: true, isActive: true, order: 0 },
      { countryName: 'India', latitude: 20.5937, longitude: 78.9629, hospitalCount: 15, displayLabel: '15+ Hospitals', isHighlighted: false, isActive: true, order: 1 },
      { countryName: 'Bangladesh', latitude: 23.685, longitude: 90.3563, hospitalCount: 5, displayLabel: '5+ Hospitals', isHighlighted: false, isActive: true, order: 2 },
      { countryName: 'Sri Lanka', latitude: 7.8731, longitude: 80.7718, hospitalCount: 3, displayLabel: '3+ Hospitals', isHighlighted: false, isActive: true, order: 3 },
      { countryName: 'Myanmar', latitude: 21.9162, longitude: 95.956, hospitalCount: 2, displayLabel: '2+ Hospitals', isHighlighted: false, isActive: true, order: 4 },
      { countryName: 'Kenya', latitude: -0.0236, longitude: 37.9062, hospitalCount: 4, displayLabel: '4+ Hospitals', isHighlighted: false, isActive: true, order: 5 },
      { countryName: 'Nigeria', latitude: 9.082, longitude: 8.6753, hospitalCount: 3, displayLabel: '3+ Hospitals', isHighlighted: false, isActive: true, order: 6 },
      { countryName: 'United States', latitude: 37.09, longitude: -95.7129, hospitalCount: 2, displayLabel: '2+ Partners', isHighlighted: false, isActive: true, order: 7 },
      { countryName: 'United Kingdom', latitude: 55.3781, longitude: -3.436, hospitalCount: 1, displayLabel: '1+ Partner', isHighlighted: false, isActive: true, order: 8 },
      { countryName: 'Bhutan', latitude: 27.5142, longitude: 90.4336, hospitalCount: 3, displayLabel: '3+ Hospitals', isHighlighted: false, isActive: true, order: 9 },
      { countryName: 'Ethiopia', latitude: 9.145, longitude: 40.4897, hospitalCount: 2, displayLabel: '2+ Hospitals', isHighlighted: false, isActive: true, order: 10 },
      { countryName: 'Tanzania', latitude: -6.369, longitude: 34.8888, hospitalCount: 1, displayLabel: '1+ Hospital', isHighlighted: false, isActive: false, order: 11 },
    ];
    for (const country of globeCountries) {
      await db.globeCountry.create({ data: country });
    }
    console.log(`  ✅ Created ${globeCountries.length} GlobeCountries`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Done
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n✅ All content seeded successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });
