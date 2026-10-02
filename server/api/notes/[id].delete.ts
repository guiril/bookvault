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

  // RLS silently skips rows the user can't delete instead of erroring, so
  // `.select().single()` is what tells us whether a row was actually deleted.
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .select()
    .single();

  // Nothing was deleted — the id doesn't exist, or RLS hid another user's
  // note. Both are reported as 404 to avoid leaking existence.
  if (error?.code === SUPABASE_ERROR_CODE.NO_ROWS) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Note not found',
    });
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete note',
    });
  }

  return sendNoContent(event);
});
