import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { slugify } from "@/lib/cms-utils";

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists (idempotent)
    const existingAdmin = await db.user.findUnique({
      where: { email: "admin@danphe.com" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: true, message: "Seed data already exists. Skipping." },
        { status: 200 }
      );
    }

    // 1. Create default admin user
    const hashedPassword = await hash("danphe2024", 10);
    const admin = await db.user.create({
      data: {
        name: "Danphe Admin",
        email: "admin@danphe.com",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    // 2. Create categories
    const categoriesData = [
      { name: "News", description: "Latest news and updates", color: "#3B82F6", sortOrder: 1 },
      { name: "Technology", description: "Technology insights and innovations", color: "#10B981", sortOrder: 2 },
      { name: "Healthcare", description: "Healthcare industry news and trends", color: "#F59E0B", sortOrder: 3 },
    ];

    const categories = await Promise.all(
      categoriesData.map((cat) =>
        db.category.create({
          data: {
            ...cat,
            slug: slugify(cat.name),
          },
        })
      )
    );

    // 3. Create sample posts
    const postsData = [
      {
        title: "Welcome to Danphe Health CMS",
        slug: slugify("Welcome to Danphe Health CMS"),
        excerpt: "An introduction to the Danphe Health Content Management System and its enterprise-grade features.",
        content: "<h2>Welcome to Danphe Health</h2><p>Danphe Health CMS is an enterprise-grade Hospital Management Information System designed to streamline healthcare operations.</p><p>With our comprehensive suite of tools, healthcare providers can manage content, track patient information, and deliver better care.</p>",
        status: "PUBLISHED" as const,
        featured: true,
        publishedAt: new Date("2024-01-15"),
        categoryId: categories[0].id,
      },
      {
        title: "Latest Technology Trends in Healthcare",
        slug: slugify("Latest Technology Trends in Healthcare"),
        excerpt: "Exploring how AI and machine learning are transforming the healthcare industry.",
        content: "<h2>Technology in Healthcare</h2><p>Artificial intelligence and machine learning are revolutionizing how healthcare providers diagnose and treat patients.</p><p>From predictive analytics to automated imaging analysis, the future of healthcare is here.</p>",
        status: "PUBLISHED" as const,
        featured: false,
        publishedAt: new Date("2024-02-10"),
        categoryId: categories[1].id,
      },
      {
        title: "Understanding Patient Data Security",
        slug: slugify("Understanding Patient Data Security"),
        excerpt: "A comprehensive guide to maintaining HIPAA compliance and protecting patient information.",
        content: "<h2>Data Security in Healthcare</h2><p>Protecting patient data is not just a legal requirement—it's a moral imperative.</p><p>This guide covers best practices for data encryption, access control, and audit logging.</p>",
        status: "DRAFT" as const,
        featured: false,
        categoryId: categories[2].id,
      },
      {
        title: "Upcoming Features in Danphe CMS v2.0",
        slug: slugify("Upcoming Features in Danphe CMS v2.0"),
        excerpt: "A sneak peek at the exciting new features coming in the next major release.",
        content: "<h2>What's Coming in v2.0</h2><p>We're excited to announce several major improvements including enhanced analytics, improved workflow automation, and a redesigned user interface.</p>",
        status: "DRAFT" as const,
        featured: false,
        categoryId: categories[1].id,
      },
      {
        title: "Year in Review: 2023 Healthcare Achievements",
        slug: slugify("Year in Review 2023 Healthcare Achievements"),
        excerpt: "Looking back at the major milestones and breakthroughs in healthcare over the past year.",
        content: "<h2>2023 Year in Review</h2><p>2023 was a remarkable year for healthcare innovation, with breakthroughs in gene therapy, telemedicine expansion, and AI-assisted diagnostics.</p>",
        status: "ARCHIVED" as const,
        featured: false,
        categoryId: categories[0].id,
      },
    ];

    await Promise.all(
      postsData.map((post) =>
        db.post.create({
          data: {
            ...post,
            authorId: admin.id,
          },
        })
      )
    );

    // 4. Create sample page
    await db.page.create({
      data: {
        title: "About Danphe Health",
        slug: slugify("About Danphe Health"),
        content: "<h2>About Us</h2><p>Danphe Health is a leading provider of enterprise-grade Hospital Management Information Systems. Our mission is to empower healthcare organizations with cutting-edge technology that improves patient outcomes and operational efficiency.</p><p>Founded with a vision to transform healthcare delivery, we serve hospitals, clinics, and healthcare networks across the globe.</p>",
        status: "PUBLISHED",
        template: "default",
        seoTitle: "About Danphe Health - Enterprise HMIS Solutions",
        seoDescription: "Learn about Danphe Health's mission to transform healthcare delivery with enterprise-grade HMIS solutions.",
        authorId: admin.id,
        publishedAt: new Date("2024-01-01"),
      },
    });

    // 5. Create default settings
    const settingsData = [
      { key: "site_title", value: "Danphe Health", type: "STRING", group: "general", label: "Site Title" },
      { key: "site_description", value: "Enterprise-Grade HMIS", type: "STRING", group: "general", label: "Site Description" },
      { key: "posts_per_page", value: "10", type: "NUMBER", group: "general", label: "Posts Per Page" },
    ];

    await Promise.all(
      settingsData.map((setting) =>
        db.setting.create({ data: setting })
      )
    );

    return NextResponse.json(
      {
        success: true,
        message: "Seed data created successfully",
        data: {
          admin: { id: admin.id, email: admin.email, role: admin.role },
          categoriesCreated: categories.length,
          postsCreated: postsData.length,
          settingsCreated: settingsData.length,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
