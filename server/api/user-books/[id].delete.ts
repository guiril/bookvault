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

  // RLS silently skips rows the user can't delete instead of erroring, so
  // `.select().single()` is what tells us whether a row was actually deleted.
  // The book's notes are removed by the `on delete cascade` on notes.
  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('id', userBookId)
    .select()
    .single();

  // Nothing was deleted — the id doesn't exist, or RLS hid another user's
  // row. Both are reported as 404 to avoid leaking existence.
  if (error?.code === SUPABASE_ERROR_CODE.NO_ROWS) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User book not found',
    });
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove book from library',
    });
  }

  return sendNoContent(event);
});
