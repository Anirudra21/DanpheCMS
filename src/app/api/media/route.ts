import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";

const ROLE_HIERARCHY = ["VIEWER", "EDITOR", "ADMIN", "SUPER_ADMIN"] as const;

function hasMinRole(userRole: string, minRole: (typeof ROLE_HIERARCHY)[number]): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole as (typeof ROLE_HIERARCHY)[number]);
  const minIndex = ROLE_HIERARCHY.indexOf(minRole);
  return userIndex >= minIndex;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// GET /api/media - List media files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const mimeType = searchParams.get("mimeType");

    const where: Record<string, unknown> = {};

    if (mimeType) {
      where.mimeType = { contains: mimeType };
    }

    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        include: {
          uploadedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/media - Upload a file
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const alt = (formData.get("alt") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type '${file.type}' is not allowed` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit" },
        { status: 400 }
      );
    }

    // Validate alt text
    const altParsed = z.string().max(255).safeParse(alt);
    if (!altParsed.success) {
      return NextResponse.json(
        { error: "Alt text must be at most 255 characters" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".bin";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "cms");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Create Media record in database
    const media = await db.media.create({
      data: {
        filename: file.name,
        alt: altParsed.data,
        mimeType: file.type,
        size: file.size,
        path: `/uploads/cms/${uniqueName}`,
        width: null,
        height: null,
        uploadedBy: session.user.id,
      },
      include: {
        uploadedByUser: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
