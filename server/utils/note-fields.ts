// Postgres `integer` tops out at 2,147,483,647; anything near that is a typo.
const MAX_PAGE = 99999;

export interface NoteFieldsBody {
  excerpt?: unknown;
  page?: unknown;
  thought?: unknown;
}

const isOptionalText = (value: unknown): value is string | null | undefined =>
  value === undefined || value === null || typeof value === 'string';

const trimToNull = (value: string | null | undefined) => value?.trim() || null;

const isValidPage = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= MAX_PAGE;

// Shared by create and update so both enforce the same rules as the
// `notes_has_text` and `notes_page_needs_excerpt` checks in schema.sql.
export const parseNoteFields = (body: NoteFieldsBody) => {
  if (!isOptionalText(body.excerpt) || !isOptionalText(body.thought)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid note text',
    });
  }

  const excerpt = trimToNull(body.excerpt);
  const thought = trimToNull(body.thought);
  const page = isValidPage(body.page) ? body.page : null;

  if (!excerpt && !thought) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing note content',
    });
  }

  // `undefined` means the field was left out of the request body.
  if (body.page !== undefined && body.page !== null && page === null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid page',
    });
  }

  if (page !== null && !excerpt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Page requires an excerpt',
    });
  }

  return { excerpt, page, thought };
};
