import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

/**
 * POST /api/seed
 * Idempotent — skips if admin user already exists.
 * Seeds all CMS models with realistic Danphe Health data.
 */
export async function POST(request: NextRequest) {
  try {
    // Check idempotency
    const existingAdmin = await db.adminUser.findFirst();
    if (existingAdmin) {
      return NextResponse.json(
        { success: true, message: "Seed data already exists. Skipping." },
        { status: 200 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@danphehealth.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "changeme-immediately";
    const hashedPassword = await hash(adminPassword, 10);

    // ── 1. Admin User ──────────────────────────────────────────────
    const admin = await db.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        name: "Danphe Admin",
        role: "SUPER_ADMIN",
      },
    });

    // ── 2. Site Setting (singleton) ───────────────────────────────
    await db.siteSetting.create({
      data: {
        logo: "/logo.svg",
        email: "info@danphehealth.com",
        phone: "+977-1-4262323",
        facebookUrl: "https://facebook.com/danphehealth",
        instagramUrl: "https://instagram.com/danphehealth",
        address: "Dillibazar, Kathmandu, Nepal",
        mapEmbedUrl:
          '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.123!2d85.324!3d27.712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1" width="100%" height="300" style="border:0;" allowfullscreen loading="lazy"></iframe>',
        footerText:
          "Danphe Health is a leading provider of enterprise-grade Hospital Management Information Systems (HMIS) designed to streamline healthcare operations across the globe.",
        copyrightText: `© ${new Date().getFullYear()} Danphe Health. All rights reserved.`,
      },
    });

    // ── 3. Nav Items ──────────────────────────────────────────────
    const navItems = [
      // Header navigation
      { label: "Solutions", url: "/solutions", order: 1, location: "HEADER" as const },
      { label: "Company", url: "/company", order: 2, location: "HEADER" as const },
      { label: "Clients", url: "/clients", order: 3, location: "HEADER" as const },
      { label: "Careers", url: "/careers", order: 4, location: "HEADER" as const },
      { label: "News & Events", url: "/news-events", order: 5, location: "HEADER" as const },
      { label: "Contact", url: "/contact", order: 6, location: "HEADER" as const },
      // Footer — Company
      { label: "About Us", url: "/company", order: 1, location: "FOOTER_COMPANY" as const },
      { label: "Our Team", url: "/company#team", order: 2, location: "FOOTER_COMPANY" as const },
      { label: "Careers", url: "/careers", order: 3, location: "FOOTER_COMPANY" as const },
      // Footer — Solutions
      { label: "OPD Management", url: "/solution/opd-management", order: 1, location: "FOOTER_SOLUTIONS" as const },
      { label: "IPD Management", url: "/solution/ipd-management", order: 2, location: "FOOTER_SOLUTIONS" as const },
      { label: "Pharmacy", url: "/solution/pharmacy", order: 3, location: "FOOTER_SOLUTIONS" as const },
      { label: "Lab & Pathology", url: "/solution/pathology-software", order: 4, location: "FOOTER_SOLUTIONS" as const },
      // Footer — Info
      { label: "News & Events", url: "/news-events", order: 1, location: "FOOTER_INFO" as const },
      { label: "Danphe Community", url: "/danphe-community", order: 2, location: "FOOTER_INFO" as const },
      { label: "Partners", url: "/partners", order: 3, location: "FOOTER_INFO" as const },
    ];
    await db.navItem.createMany({ data: navItems });

    // ── 4. Homepage Sections ───────────────────────────────────────
    const homepageSections = [
      {
        key: "hero",
        heading: "Enterprise-Grade Hospital Management Information System",
        subheading: "Trusted by 700+ healthcare facilities across 10+ countries. Open-source, web-based, and built for modern healthcare.",
        body: "",
        image: "/hero-bg.jpg",
        ctaLabel: "Schedule a Demo",
        ctaUrl: "/schedule-a-demo",
        order: 1,
      },
      {
        key: "value_adds",
        heading: "What Values DANPHE Can Add",
        subheading: "Streamline your hospital operations with our comprehensive HMIS",
        body: "<ul><li>Centralised patient records across all departments</li><li>Automated billing, inventory, and pharmacy workflows</li><li>Real-time analytics for data-driven decisions</li><li>Customisable modules that grow with your facility</li></ul>",
        image: "/about-img.png",
        ctaLabel: "",
        ctaUrl: "",
        order: 2,
      },
      {
        key: "solutions_intro",
        heading: "Discover a Complete Solution for HIMS with EMR",
        subheading: "Nine integrated modules covering every aspect of hospital management",
        body: "<p>Danphe HMIS provides an end-to-end solution that connects every department — from OPD and IPD to pharmacy, lab, radiology, and beyond. Each module communicates seamlessly, eliminating data silos and reducing manual errors.</p>",
        image: "",
        ctaLabel: "Explore Solutions",
        ctaUrl: "/solutions",
        order: 3,
      },
      {
        key: "features_row",
        heading: "Why Choose Danphe HMIS?",
        subheading: "Built for modern healthcare with unmatched flexibility",
        body: "<p>From real-time dashboards to role-based access controls, Danphe HMIS is engineered for reliability, security, and ease of use.</p>",
        image: "",
        ctaLabel: "Learn More",
        ctaUrl: "/company",
        order: 4,
      },
      {
        key: "testimonial_intro",
        heading: "What Our Clients Say",
        subheading: "Hear from healthcare professionals who trust Danphe every day",
        body: "",
        image: "",
        ctaLabel: "",
        ctaUrl: "",
        order: 5,
      },
      {
        key: "newsletter_cta",
        heading: "Stay Updated with Danphe Health",
        subheading: "Subscribe to our newsletter for the latest product updates, community events, and healthcare IT insights.",
        body: "",
        image: "",
        ctaLabel: "Subscribe Now",
        ctaUrl: "/contact",
        order: 6,
      },
    ];
    await db.homepageSection.createMany({ data: homepageSections });

    // ── 5. Solutions + Features ───────────────────────────────────
    const solutions = [
      {
        title: "OPD Management",
        slug: "opd-management",
        shortDescription:
          "Comprehensive outpatient department management with queue handling, token systems, and electronic medical records.",
        body: "",
        iconUrl: "",
        heroImageUrl: "",
        order: 1,
        isPublished: true,
        features: [
          "Token & Queue Management",
          "Doctor Consultation Notes",
          "Prescription Management",
          "Lab & Radiology Orders",
          "Vital Signs Recording",
          "Follow-up Scheduling",
        ],
      },
      {
        title: "IPD Management",
        slug: "ipd-management",
        shortDescription:
          "End-to-end inpatient management from admission to discharge with bed tracking, billing, and clinical workflows.",
        body: "",
        iconUrl: "",
        heroImageUrl: "",
        order: 2,
        isPublished: true,
        features: [
          "Bed Management & Allocation",
          "Admission & Discharge Workflow",
          "Inpatient Billing",
          "Nurse Station Dashboard",
          "Ward Round Management",
          "Transfer & Referral Tracking",
        ],
      },
      {
        title: "Pharmacy",
        slug: "pharmacy",
        shortDescription:
          "Full-featured pharmacy management covering inventory control, dispensing, and procurement workflows.",
        body: "",
        iconUrl: "",
        heroImageUrl: "",
        order: 3,
        isPublished: true,
        features: [
          "Medicine Inventory",
          "Prescription Dispensing",
          "Stock Reorder Alerts",
          "Batch & Expiry Tracking",
          "Purchase Order Management",
          "Pharmacy Billing",
        ],
      },
    ];

    for (const sol of solutions) {
      const { features, ...solData } = sol;
      const created = await db.solution.create({ data: solData });
      await db.solutionFeature.createMany({
        data: features.map((label, idx) => ({
          label,
          order: idx + 1,
          solutionId: created.id,
        })),
      });
    }

    // ── 6. Team Members ───────────────────────────────────────────
    const teamMembers = [
      { name: "Ram Dhungana", title: "Chairman", photoUrl: "/team/ram-dhungana.jpg", order: 1, isPublished: true },
      { name: "Prabhat Adhikari", title: "Co-Founder and Clinical Director", photoUrl: "/team/prabhat-adhikari.jpg", order: 2, isPublished: true },
      { name: "Shiv Koirala", title: "Co-Founder and Technical Director", photoUrl: "/team/shiv-koirala.jpg", order: 3, isPublished: true },
      { name: "Binod Dhungana", title: "Co-founder and Director", photoUrl: "/team/binod-dhungana.jpg", order: 4, isPublished: true },
    ];
    await db.teamMember.createMany({ data: teamMembers });

    // ── 7. Stats ──────────────────────────────────────────────────
    const stats = [
      { label: "Healthcare Facilities", value: "700", suffix: "+", order: 1 },
      { label: "Countries", value: "10", suffix: "+", order: 2 },
      { label: "Years of Experience", value: "15", suffix: "+", order: 3 },
      { label: "Active Users", value: "50", suffix: "K+", order: 4 },
    ];
    await db.stat.createMany({ data: stats });

    // ── 8. Testimonials ───────────────────────────────────────────
    const testimonials = [
      {
        quote: "Danphe HMIS has transformed the way we manage our hospital operations. The system is intuitive, reliable, and has significantly improved our efficiency.",
        authorName: "Dr. Suresh Sharma",
        authorOrg: "Nepal Medical College",
        imageUrl: "",
        order: 1,
        isPublished: true,
      },
      {
        quote: "The OPD and IPD modules have streamlined our patient workflows. Our staff adapted quickly thanks to the user-friendly interface.",
        authorName: "Dr. Anita Gurung",
        authorOrg: "Kathmandu Hospital",
        imageUrl: "",
        order: 2,
        isPublished: true,
      },
      {
        quote: "Being open-source gave us the flexibility to customize the system to our specific needs. The support team is exceptional.",
        authorName: "Rajesh Thapa",
        authorOrg: "Pokhara Healthcare",
        imageUrl: "",
        order: 3,
        isPublished: true,
      },
    ];
    await db.testimonial.createMany({ data: testimonials });

    // ── 9. Client Logos ───────────────────────────────────────────
    const clientLogos = [
      { name: "Nepal Medical College", logoUrl: "", order: 1, showOnHomepage: true, isPublished: true },
      { name: "Kathmandu Hospital", logoUrl: "", order: 2, showOnHomepage: true, isPublished: true },
      { name: "Patan Hospital", logoUrl: "", order: 3, showOnHomepage: true, isPublished: true },
      { name: "Bheri Hospital", logoUrl: "", order: 4, showOnHomepage: true, isPublished: true },
      { name: "Gandaki Hospital", logoUrl: "", order: 5, showOnHomepage: true, isPublished: true },
      { name: "Pokhara Academy", logoUrl: "", order: 6, showOnHomepage: true, isPublished: true },
    ];
    await db.clientLogo.createMany({ data: clientLogos });

    // ── 10. Sample Posts ──────────────────────────────────────────
    const posts = [
      {
        title: "Danphe HMIS v2.0 Released with Enhanced Analytics",
        slug: "danphe-hmis-v2-released",
        coverImageUrl: "",
        author: "Danphe Health Team",
        publishedAt: new Date("2024-06-15"),
        excerpt: "We are excited to announce the release of Danphe HMIS v2.0, featuring a completely redesigned analytics dashboard and improved workflow automation.",
        body: "<h2>What's New in v2.0</h2><p>Danphe HMIS v2.0 brings a host of new features designed to make healthcare management even more efficient.</p><h3>Enhanced Analytics Dashboard</h3><p>Get real-time insights into hospital operations with our new interactive analytics dashboard.</p>",
        type: "NEWS_EVENT" as const,
        status: "PUBLISHED" as const,
      },
      {
        title: "Danphe Community Meetup 2024",
        slug: "danphe-community-meetup-2024",
        coverImageUrl: "",
        author: "Danphe Health Team",
        publishedAt: new Date("2024-05-20"),
        excerpt: "Join us for the annual Danphe Community Meetup where healthcare professionals and developers come together to share experiences.",
        body: "<h2>Community Meetup 2024</h2><p>We're hosting our annual community meetup in Kathmandu. Come connect with other healthcare IT professionals.</p>",
        type: "COMMUNITY" as const,
        status: "PUBLISHED" as const,
      },
    ];
    await db.post.createMany({ data: posts });

    // ── 11. Sample Jobs ───────────────────────────────────────────
    const jobs = [
      {
        title: "Senior React Developer",
        department: "Engineering",
        location: "Kathmandu, Nepal",
        employmentType: "Full-time",
        description: "<p>We are looking for an experienced React developer to join our frontend team working on Danphe HMIS.</p>",
        requirements: "<ul><li>5+ years of React experience</li><li>TypeScript proficiency</li><li>Healthcare IT experience is a plus</li></ul>",
        applyEmail: "careers@danphehealth.com",
        status: "OPEN" as const,
        postedAt: new Date(),
      },
      {
        title: "QA Engineer",
        department: "Quality Assurance",
        location: "Kathmandu, Nepal",
        employmentType: "Full-time",
        description: "<p>Join our QA team to ensure the highest quality of our hospital management software.</p>",
        requirements: "<ul><li>3+ years in software testing</li><li>Experience with automated testing tools</li><li>Knowledge of healthcare workflows</li></ul>",
        applyEmail: "careers@danphehealth.com",
        status: "OPEN" as const,
        postedAt: new Date(),
      },
    ];
    await db.job.createMany({ data: jobs });

    return NextResponse.json(
      {
        success: true,
        message: "Seed data created successfully",
        data: {
          admin: { id: admin.id, email: admin.email, role: admin.role },
          navItems: navItems.length,
          homepageSections: homepageSections.length,
          solutions: solutions.length,
          teamMembers: teamMembers.length,
          stats: stats.length,
          testimonials: testimonials.length,
          clientLogos: clientLogos.length,
          posts: posts.length,
          jobs: jobs.length,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
