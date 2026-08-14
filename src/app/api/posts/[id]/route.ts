import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/posts/:id — single post
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await db.post.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Post get error:', error);
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}

/**
 * PUT /api/posts/:id — update a post
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, coverImageUrl, author, publishedAt, excerpt, body: postBody, type, status } = body;

    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = await db.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug: slug?.trim() ?? existing.slug }),
        ...(coverImageUrl !== undefined && { coverImageUrl: coverImageUrl?.trim() ?? '' }),
        ...(author !== undefined && { author: author?.trim() ?? '' }),
        ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
        ...(excerpt !== undefined && { excerpt: excerpt?.trim() ?? '' }),
        ...(postBody !== undefined && { body: postBody ?? '' }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/:id — delete a post
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await db.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
