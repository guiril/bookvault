import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

import type { UserBookStatus } from '~/types/database';

interface UpdateUserBookBody {
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

  const userBookId = getRouterParam(event, 'id');

  if (!userBookId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user book id',
    });
  }

  const body = await readBody<UpdateUserBookBody>(event);

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

  const finishedAt =
    body.status === 'finished'
      ? (body.finished_at ?? getTodayDateString())
      : null;

  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase
    .from('user_books')
    .update({
      status: body.status,
      // Leaving `started_at` out of the body keeps the stored value.
      ...(body.started_at !== undefined && { started_at: body.started_at }),
      finished_at: finishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userBookId)
    .select()
    .single();

  // The id doesn't exist, or RLS hid another user's row. Both are reported
  // as 404 to avoid leaking existence.
  if (error?.code === SUPABASE_ERROR_CODE.NO_ROWS) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User book not found',
    });
  }

  if (error?.code === SUPABASE_ERROR_CODE.CHECK_VIOLATION) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Finished date is before start date',
    });
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update book',
    });
  }

  return data;
});
