import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

// Every editable field is required, since the content rules depend on all of
// them together. `user_book_id: null` moves the note to uncategorized.
interface UpdateNoteBody extends NoteFieldsBody {
  user_book_id: string | null;
}

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

  const body = await readBody<UpdateNoteBody>(event);

  if (
    body.user_book_id !== null &&
    (typeof body.user_book_id !== 'string' || !body.user_book_id)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user book id',
    });
  }

  const noteFields = parseNoteFields(body);

  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase
    .from('notes')
    .update({
      user_book_id: body.user_book_id,
      ...noteFields,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select()
    .single();

  // Nothing was updated — the id doesn't exist, or RLS hid another user's
  // note. Both are reported as 404 to avoid leaking existence.
  if (error?.code === SUPABASE_ERROR_CODE.NO_ROWS) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Note not found',
    });
  }

  // The target user book doesn't exist or belongs to another user.
  if (error?.code === SUPABASE_ERROR_CODE.RLS_VIOLATION) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User book not found',
    });
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update note',
    });
  }

  return data;
});
