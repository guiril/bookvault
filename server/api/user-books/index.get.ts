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

  const { data, error } = await supabase
    .from('user_books')
    .select('*, book:books(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load books',
    });
  }

  return data;
});
