import type { NewBook } from '~/types/database';

// https://developers.google.com/books/docs/v1/reference/volumes#resource
export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

export const mapVolumeToBook = (volume: GoogleBooksVolume): NewBook => {
  const { volumeInfo } = volume;

  const author = volumeInfo.authors?.join('、') ?? '';

  const thumbnail =
    volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail;
  // Google often returns http:// cover URLs; force https so they don't load
  // as mixed content on an https page.
  const coverUrl = thumbnail ? thumbnail.replace('http://', 'https://') : null;

  return {
    google_books_id: volume.id,
    title: volumeInfo.title,
    author,
    cover_url: coverUrl,
    description: volumeInfo.description ?? null,
  };
};
