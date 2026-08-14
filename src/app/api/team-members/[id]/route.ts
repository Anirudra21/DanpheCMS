import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/team-members/:id — single team member
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const member = await db.teamMember.findUnique({ where: { id } });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('TeamMember get error:', error);
    return NextResponse.json({ error: 'Failed to load team member' }, { status: 500 });
  }
}

/**
 * PUT /api/team-members/:id — update a team member
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, title, photoUrl, order, isPublished } = body;

    const existing = await db.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const member = await db.teamMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(title !== undefined && { title: title?.trim() ?? '' }),
        ...(photoUrl !== undefined && { photoUrl: photoUrl?.trim() ?? '' }),
        ...(order !== undefined && { order: typeof order === 'number' ? order : existing.order }),
        ...(isPublished !== undefined && { isPublished: isPublished === true }),
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('TeamMember update error:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

/**
 * DELETE /api/team-members/:id — delete a team member
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    await db.teamMember.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('TeamMember delete error:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}
