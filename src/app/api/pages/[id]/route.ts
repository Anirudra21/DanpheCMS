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

const updatePageSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  slug: z.string().max(255).optional(),
  content: z.string().min(1, "Content is required").optional(),
  template: z.string().optional(),
  seoTitle: z.string().max(255).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

// GET /api/pages/[id] - Get a single page
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const page = await db.page.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/pages/[id] - Update a page
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

    const existingPage = await db.page.findUnique({ where: { id } });
    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updatePageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, slug, content, template, seoTitle, seoDescription, status } = parsed.data;

    // Auto-generate slug from title if title changed and slug not provided
    let finalSlug = slug;
    if (title && !slug) {
      finalSlug = slugify(title);
      const slugExists = await db.page.findFirst({ where: { slug: finalSlug, NOT: { id } } });
      if (slugExists) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    } else if (slug) {
      const slugExists = await db.page.findFirst({ where: { slug, NOT: { id } } });
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
      finalSlug = slug;
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (finalSlug !== undefined) updateData.slug = finalSlug;
    if (content !== undefined) updateData.content = content;
    if (template !== undefined) updateData.template = template;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "PUBLISHED" && !existingPage.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const page = await db.page.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ page });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/pages/[id] - Delete a page
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

    const existingPage = await db.page.findUnique({ where: { id } });
    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await db.page.delete({ where: { id } });

    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
