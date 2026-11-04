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
    .select('*, notes(count)')
    .order('created_at', { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load books',
    });
  }

  // Supabase wraps the count as `notes: [{ count }]`.
  return data.map(({ notes, ...userBook }) => ({
    ...userBook,
    note_count: notes[0]?.count ?? 0,
  }));
});
