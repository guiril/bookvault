export type UserBookStatus = 'reading' | 'finished';

export interface Book {
  id: string;
  google_books_id: string | null;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: UserBookStatus;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_book_id: string;
  content: string;
  created_at: string;
}
