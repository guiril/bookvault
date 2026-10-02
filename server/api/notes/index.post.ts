import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

interface CreateNoteBody {
  user_book_id: string;
  content: string;
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

  if (typeof body.user_book_id !== 'string' || !body.user_book_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user book id',
    });
  }

  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing note content',
    });
  }

  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_book_id: body.user_book_id,
      content,
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
