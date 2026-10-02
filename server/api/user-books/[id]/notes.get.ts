import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const userBookId = getRouterParam(event, 'id');

  if (!userBookId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user book id',
    });
  }

  const supabase = await serverSupabaseClient(event);

  // Querying notes directly would return an empty array both for a book with
  // no notes and for a book the user can't see. Going through the user book
  // tells the two apart.
  const { data, error } = await supabase
    .from('user_books')
    .select('id, notes(*)')
    .eq('id', userBookId)
    .order('created_at', { referencedTable: 'notes', ascending: false })
    .single();

  // The id doesn't exist, or RLS hid another user's row. Both are reported
  // as 404 to avoid leaking existence.
  if (error?.code === SUPABASE_ERROR_CODE.NO_ROWS) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User book not found',
    });
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load notes',
    });
  }

  return data.notes;
});
