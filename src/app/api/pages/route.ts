import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { slugify } from "@/lib/cms-utils";

const ROLE_HIERARCHY = ["VIEWER", "EDITOR", "ADMIN", "SUPER_ADMIN"] as const;

function hasMinRole(userRole: string, minRole: (typeof ROLE_HIERARCHY)[number]): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole as (typeof ROLE_HIERARCHY)[number]);
  const minIndex = ROLE_HIERARCHY.indexOf(minRole);
  return userIndex >= minIndex;
}

const createPageSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  template: z.string().optional().default("default"),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
});

// GET /api/pages - List pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));

    const where: Record<string, unknown> = {};

    if (status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      where.status = status;
    }

    const [pages, total] = await Promise.all([
      db.page.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.page.count({ where }),
    ]);

    return NextResponse.json({
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch pages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/pages - Create a new page (EDITOR+)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !hasMinRole(userRole, "EDITOR")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createPageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, content, template, seoTitle, seoDescription, status } = parsed.data;

    // Generate unique slug
    let slug = slugify(title);
    const existingPage = await db.page.findUnique({ where: { slug } });
    if (existingPage) {
      slug = `${slug}-${Date.now()}`;
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        content,
        template,
        seoTitle,
        seoDescription,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
