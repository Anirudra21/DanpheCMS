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

const updatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  slug: z.string().max(255).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required").optional(),
  coverImage: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
});

// GET /api/posts/[id] - Get a single post
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
        category: { select: { id: true, name: true, slug: true, color: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !hasMinRole(userRole, "EDITOR")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;

    const existingPost = await db.post.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // VIEWER can only edit their own posts, EDITOR+ can edit any
    if (userRole === "VIEWER" && existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own posts" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, slug, excerpt, content, coverImage, status, featured, categoryId } = parsed.data;

    // Auto-generate slug from title if title changed and slug not provided
    let finalSlug = slug;
    if (title && !slug) {
      finalSlug = slugify(title);
      const slugExists = await db.post.findFirst({ where: { slug: finalSlug, NOT: { id } } });
      if (slugExists) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    } else if (slug) {
      const slugExists = await db.post.findFirst({ where: { slug, NOT: { id } } });
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
      finalSlug = slug;
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (finalSlug !== undefined) updateData.slug = finalSlug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "PUBLISHED" && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (featured !== undefined) updateData.featured = featured;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const post = await db.post.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
        category: { select: { id: true, name: true, slug: true, color: true } },
      },
    });

    return NextResponse.json({ post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !hasMinRole(userRole, "EDITOR")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;

    const existingPost = await db.post.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await db.post.delete({ where: { id } });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
