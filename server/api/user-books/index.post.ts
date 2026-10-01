import {
  serverSupabaseClient,
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';

import type { UserBookStatus } from '~/types/database';

interface CreateUserBookBody {
  google_books_id?: string;
  title: string;
  author: string;
  cover_url?: string;
  description?: string;
  status: UserBookStatus;
  started_at?: string;
  finished_at?: string;
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

  // `books` is shared across users and RLS only allows SELECT, so writes
  // need the service-role client, which bypasses RLS.
  const serviceRoleClient = serverSupabaseServiceRole(event);

  const { data: book, error: upsertBookError } = await serviceRoleClient
    .from('books')
    .upsert(
      {
        google_books_id: body.google_books_id,
        title: body.title,
        author: body.author,
        cover_url: body.cover_url,
        description: body.description,
      },
      { onConflict: 'google_books_id' },
    )
    .select('id')
    .single();

  if (upsertBookError || !book) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save book',
    });
  }

  const supabase = await serverSupabaseClient(event);

  const { data: userBook, error: insertUserBookError } = await supabase
    .from('user_books')
    .insert({
      // serverSupabaseUser returns the raw JWT payload; the user id is `sub`.
      user_id: user.sub,
      book_id: book.id,
      status: body.status,
      started_at: body.started_at,
      finished_at: body.status === 'finished' ? body.finished_at : null,
    })
    .select()
    .single();

  if (insertUserBookError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add book to library',
    });
  }

  return userBook;
});
