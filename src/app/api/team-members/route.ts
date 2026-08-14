import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/team-members — list all team members ordered by `order`
 */
export async function GET() {
  try {
    const members = await db.teamMember.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error('TeamMembers list error:', error);
    return NextResponse.json({ error: 'Failed to load team members' }, { status: 500 });
  }
}

/**
 * POST /api/team-members — create a new team member
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, title, photoUrl, order, isPublished } = data;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const member = await db.teamMember.create({
      data: {
        name: name.trim(),
        title: title?.trim() ?? '',
        photoUrl: photoUrl?.trim() ?? '',
        order: typeof order === 'number' ? order : 0,
        isPublished: isPublished === true,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('TeamMember create error:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}

/**
 * PUT /api/team-members — bulk reorder (expects { items: [{id, order}] })
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    await db.$transaction(
      items.map((item: { id: string; order: number }) =>
        db.teamMember.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('TeamMember reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder team members' }, { status: 500 });
  }
}
