-- bookvault schema + RLS policies
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query).

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  google_books_id text unique,
  title text not null,
  author text not null default '',
  cover_url text,
  description text
);

create table if not exists user_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  book_id uuid not null references books (id),
  status text not null check (status in ('reading', 'finished')),
  started_at date,
  finished_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_book_id uuid not null references user_books (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table books enable row level security;
alter table user_books enable row level security;
alter table notes enable row level security;

-- books: read-only for authenticated users; writes go through the
-- server-side service-role client, which bypasses RLS.
create policy "books_select_authenticated"
  on books for select
  to authenticated
  using (true);

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

-- notes: access is gated through the owning user_books row.
create policy "notes_select_own"
  on notes for select
  to authenticated
  using (
    user_book_id in (
      select id from user_books where user_id = auth.uid()
    )
  );

create policy "notes_insert_own"
  on notes for insert
  to authenticated
  with check (
    user_book_id in (
      select id from user_books where user_id = auth.uid()
    )
  );

create policy "notes_delete_own"
  on notes for delete
  to authenticated
  using (
    user_book_id in (
      select id from user_books where user_id = auth.uid()
    )
  );
