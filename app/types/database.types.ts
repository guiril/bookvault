// `@nuxtjs/supabase` looks for a `Database` type at this exact path by
// default and uses it to type every `.from(...)` query. Without it,
// `serverSupabaseClient` falls back to `Database = unknown` and all query
// results type as `never`.
// Hand-written to match the shape Supabase's own `supabase gen types
// typescript` generator produces (see supabase/schema.sql for the source of
// truth) — keep the two in sync manually when the schema changes. Every
// table needs a `Relationships` entry (even if empty) or it fails to
// structurally match `GenericTable` and query types collapse to `never`.
import type { UserBookStatus } from './database';

export interface Database {
  public: {
    Tables: {
      user_books: {
        Row: {
          id: string;
          user_id: string;
          google_books_id: string | null;
          title: string;
          author: string;
          cover_url: string | null;
          description: string | null;
          status: UserBookStatus;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          google_books_id?: string | null;
          title: string;
          author?: string;
          cover_url?: string | null;
          description?: string | null;
          status: UserBookStatus;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          google_books_id?: string | null;
          title?: string;
          author?: string;
          cover_url?: string | null;
          description?: string | null;
          status?: UserBookStatus;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_book_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_book_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_book_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_user_book_id_fkey';
            columns: ['user_book_id'];
            isOneToOne: false;
            referencedRelation: 'user_books';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
