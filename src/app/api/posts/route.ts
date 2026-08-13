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

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
  featured: z.boolean().optional().default(false),
  categoryId: z.string().optional(),
});

// GET /api/posts - List posts with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    if (status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
          category: { select: { id: true, name: true, slug: true, color: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/posts - Create a new post (EDITOR+)
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
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, excerpt, content, coverImage, status, featured, categoryId } = parsed.data;

    // Generate unique slug
    let slug = slugify(title);
    const existingPost = await db.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        status,
        featured,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: session.user.id,
        categoryId: categoryId || null,
      },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
        category: { select: { id: true, name: true, slug: true, color: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
