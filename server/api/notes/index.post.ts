import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

interface CreateNoteBody extends NoteFieldsBody {
  user_book_id?: string | null;
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const body = await readBody<CreateNoteBody>(event);

  // Leaving the book out saves the note as uncategorized.
  const userBookId = body.user_book_id ?? null;

  if (userBookId !== null && (typeof userBookId !== 'string' || !userBookId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user book id',
    });
  }

  const noteFields = parseNoteFields(body);

  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_book_id: userBookId,
      ...noteFields,
    })
    .select()
    .single();

  // The user book doesn't exist or belongs to another user. Reported as 404
  // to avoid leaking existence.
  if (error?.code === SUPABASE_ERROR_CODE.RLS_VIOLATION) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User book not found',
    });
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add note',
    });
  }

  return data;
});
