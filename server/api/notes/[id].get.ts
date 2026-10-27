import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const noteId = getRouterParam(event, 'id');

  if (!noteId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing note id',
    });
  }

  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase
    .from('notes')
    .select('*, user_book:user_books(id, title, author, cover_url)')
    .eq('id', noteId)
    .single();

  // The id doesn't exist, or RLS hid another user's note. Both are reported
  // as 404 to avoid leaking existence.
  if (error?.code === SUPABASE_ERROR_CODE.NO_ROWS) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Note not found',
    });
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load note',
    });
  }

  return data;
});
