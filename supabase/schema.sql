-- bookvault schema + RLS policies
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query).

create table if not exists user_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  google_books_id text,
  title text not null,
  author text not null default '',
  cover_url text,
  description text,
  status text not null default 'reading'
    check (status in ('reading', 'finished')),
  started_at date,
  finished_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, google_books_id),
  constraint user_books_finished_after_started
    check (finished_at >= started_at)
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  -- Null means the note is uncategorized. Deleting a book keeps its notes.
  user_book_id uuid references user_books (id) on delete set null,
  -- Legacy single-field note, still written by older deployments.
  content text,
  -- A note with an excerpt is a quote from the book; without one it's an
  -- inspiration, and `thought` holds its text.
  excerpt text,
  page integer check (page > 0),
  thought text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_has_text
    check (excerpt is not null or thought is not null or content is not null),
  constraint notes_page_needs_excerpt
    check (page is null or excerpt is not null)
);

alter table user_books enable row level security;
alter table notes enable row level security;

-- user_books: each user can only see/modify their own rows.
create policy "user_books_select_own"
  on user_books for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_books_insert_own"
  on user_books for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_books_update_own"
  on user_books for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_books_delete_own"
  on user_books for delete
  to authenticated
  using (user_id = auth.uid());

-- notes: each user can only see/modify their own rows, and can only attach a
-- note to one of their own books.
create policy "notes_select_own"
  on notes for select
  to authenticated
  using (user_id = auth.uid());

create policy "notes_insert_own"
  on notes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      user_book_id is null
      or user_book_id in (
        select id from user_books where user_id = auth.uid()
      )
    )
  );

create policy "notes_update_own"
  on notes for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      user_book_id is null
      or user_book_id in (
        select id from user_books where user_id = auth.uid()
      )
    )
  );

create policy "notes_delete_own"
  on notes for delete
  to authenticated
  using (user_id = auth.uid());
