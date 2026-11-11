import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

interface CreateUserBookBody {
  google_books_id?: unknown;
  title?: unknown;
  author?: unknown;
  cover_url?: unknown;
  description?: unknown;
}

// Optional fields may be left out or null, but must be strings when present.
// Blank strings are stored as null.
const readOptionalText = (value: unknown) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value.trim() || null;

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid book fields',
  });
};

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const body = await readBody<CreateUserBookBody>(event);
  const title = typeof body.title === 'string' ? body.title.trim() : '';

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing title',
    });
  }

  const googleBooksId = readOptionalText(body.google_books_id);
  // `author` is `not null default ''` in schema.sql.
  const author = readOptionalText(body.author) ?? '';
  const coverUrl = readOptionalText(body.cover_url);
  const description = readOptionalText(body.description);

  const supabase = await serverSupabaseClient(event);

  const { data: userBook, error: insertUserBookError } = await supabase
    .from('user_books')
    .insert({
      // serverSupabaseUser returns the raw JWT payload; the user id is `sub`.
      user_id: user.sub,
      google_books_id: googleBooksId,
      title,
      author,
      cover_url: coverUrl,
      description,
    })
    .select()
    .single();

  if (insertUserBookError?.code === SUPABASE_ERROR_CODE.UNIQUE_VIOLATION) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Book already in library',
    });
  }

  if (insertUserBookError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add book to library',
    });
  }

  return userBook;
});
