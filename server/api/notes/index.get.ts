import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const supabase = await serverSupabaseClient(event);

  // `user_book` is null for uncategorized notes.
  const { data, error } = await supabase
    .from('notes')
    .select('*, user_book:user_books(id, title, author, cover_url)')
    .order('created_at', { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load notes',
    });
  }

  return data;
});
