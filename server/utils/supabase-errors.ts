// https://supabase.com/docs/guides/api/rest/postgrest-error-codes
export const SUPABASE_ERROR_CODE = {
  // `.single()` matched zero (or more than one) rows.
  NO_ROWS: 'PGRST116',
  // insufficient_privilege: an RLS `with check` rejected the row.
  RLS_VIOLATION: '42501',
  // unique_violation: the row conflicts with a unique constraint.
  UNIQUE_VIOLATION: '23505',
} as const;
