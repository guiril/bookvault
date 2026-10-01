import { serverSupabaseUser } from '#supabase/server';

import type { GoogleBooksVolume } from '../../utils/google-books';

interface GoogleBooksSearchResponse {
  items?: GoogleBooksVolume[];
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const query = getQuery(event);
  const searchTerm = query.q;

  if (typeof searchTerm !== 'string' || !searchTerm.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing search query',
    });
  }

  const config = useRuntimeConfig(event);

  // Proxied through the server so the API key never reaches the browser.
  const searchResult = await $fetch<GoogleBooksSearchResponse>(
    'https://www.googleapis.com/books/v1/volumes',
    {
      query: {
        q: searchTerm,
        maxResults: 8,
        key: config.googleBooksApiKey,
      },
    },
  );

  const volumes = searchResult.items ?? [];

  return volumes.map((volume) => mapVolumeToBook(volume));
});
