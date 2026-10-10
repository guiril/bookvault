import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

import type { UserBookStatus } from '~/types/database';

interface CreateUserBookBody {
  google_books_id?: string;
  title: string;
  author: string;
  cover_url?: string;
  description?: string;
  status: UserBookStatus;
  started_at?: string | null;
  finished_at?: string | null;
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const body = await readBody<CreateUserBookBody>(event);

  if (body.status !== 'reading' && body.status !== 'finished') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid status',
    });
  }

  if (!isOptionalDate(body.started_at) || !isOptionalDate(body.finished_at)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid date',
    });
  }

  const supabase = await serverSupabaseClient(event);

  const { data: userBook, error: insertUserBookError } = await supabase
    .from('user_books')
    .insert({
      // serverSupabaseUser returns the raw JWT payload; the user id is `sub`.
      user_id: user.sub,
      google_books_id: body.google_books_id,
      title: body.title,
      author: body.author,
      cover_url: body.cover_url,
      description: body.description,
      status: body.status,
      started_at: body.started_at,
      finished_at: body.status === 'finished' ? body.finished_at : null,
    })
    .select()
    .single();

  if (insertUserBookError?.code === SUPABASE_ERROR_CODE.UNIQUE_VIOLATION) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Book already in library',
    });
  }

  if (insertUserBookError?.code === SUPABASE_ERROR_CODE.CHECK_VIOLATION) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Finished date is before start date',
    });
  }

  if (insertUserBookError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add book to library',
    });
  }

  return userBook;
});
