import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/cms-utils';

/**
 * GET /api/posts — list all posts ordered by `publishedAt` desc.
 * Supports ?type=NEWS_EVENT or ?type=COMMUNITY for filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where = type ? { type: type as 'NEWS_EVENT' | 'COMMUNITY' } : {};

    const posts = await db.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Posts list error:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}

/**
 * POST /api/posts — create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, slug, coverImageUrl, author, publishedAt, excerpt, body, type, status } = data;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!type || !['NEWS_EVENT', 'COMMUNITY'].includes(type)) {
      return NextResponse.json({ error: 'Type is required (NEWS_EVENT or COMMUNITY)' }, { status: 400 });
    }

    const finalSlug = slug?.trim() ? slug.trim() : slugify(title.trim());

    const post = await db.post.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        coverImageUrl: coverImageUrl?.trim() ?? '',
        author: author?.trim() ?? '',
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        excerpt: excerpt?.trim() ?? '',
        body: body ?? '',
        type,
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Post create error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

/**
 * PUT /api/posts — bulk status toggle { ids: string[], status: 'PUBLISHED'|'DRAFT' }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
    }

    if (!['PUBLISHED', 'DRAFT'].includes(status)) {
      return NextResponse.json({ error: 'status must be PUBLISHED or DRAFT' }, { status: 400 });
    }

    await db.post.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post bulk update error:', error);
    return NextResponse.json({ error: 'Failed to update posts' }, { status: 500 });
  }
}
