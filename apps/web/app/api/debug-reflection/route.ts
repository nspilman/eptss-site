import { NextResponse } from 'next/server';
import { db, userContent, contentTags, tags } from '@eptss/db';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@eptss/auth/server';

export async function GET() {
  try {
    const { userId } = await getAuthUser();

    // Get all reflections for this user
    const reflections = await db
      .select()
      .from(userContent)
      .where(eq(userContent.userId, userId));

    // Get all tags
    const allTags = await db
      .select()
      .from(tags);

    // Get all content_tags associations
    const allContentTags = await db
      .select()
      .from(contentTags);

    // Get the specific initial tag
    const initialTag = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, 'reflection-type:initial'))
      .limit(1);

    return NextResponse.json({
      userId,
      reflections,
      allTags,
      allContentTags,
      initialTag,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
