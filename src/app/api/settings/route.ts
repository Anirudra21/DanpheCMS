import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const ROLE_HIERARCHY = ["VIEWER", "EDITOR", "ADMIN", "SUPER_ADMIN"] as const;

function hasMinRole(userRole: string, minRole: (typeof ROLE_HIERARCHY)[number]): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole as (typeof ROLE_HIERARCHY)[number]);
  const minIndex = ROLE_HIERARCHY.indexOf(minRole);
  return userIndex >= minIndex;
}

const settingSchema = z.object({
  key: z.string().min(1, "Key is required").max(100),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "json"]).optional(),
  group: z.string().optional(),
  label: z.string().optional(),
});

const upsertSettingsSchema = z.object({
  settings: z.array(settingSchema).min(1, "At least one setting is required"),
});

// GET /api/settings - Get all settings or filter by group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");

    const where: Record<string, unknown> = {};

    if (group) {
      where.group = group;
    }

    const settings = await db.setting.findMany({
      where,
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    // Convert to key-value map for convenience
    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json({ settings, settingsMap });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/settings - Upsert settings (SUPER_ADMIN only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !hasMinRole(userRole, "SUPER_ADMIN")) {
      return NextResponse.json({ error: "SUPER_ADMIN access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = upsertSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      parsed.data.settings.map((setting) =>
        db.setting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            ...(setting.type !== undefined && { type: setting.type }),
            ...(setting.group !== undefined && { group: setting.group }),
            ...(setting.label !== undefined && { label: setting.label }),
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type || "string",
            group: setting.group || "general",
            label: setting.label || setting.key,
          },
        })
      )
    );

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
