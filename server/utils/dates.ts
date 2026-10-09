const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toUtcDateString = (date: Date) => date.toISOString().slice(0, 10);

// `new Date('2026-02-30')` silently rolls over to March 2nd, so the parsed
// date is converted back and compared to reject days that don't exist.
const isDateString = (value: unknown): value is string => {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;

  // Date-only ISO strings are parsed as UTC, as `toUtcDateString()` expects.
  const parsedDate = new Date(value);

  return (
    !Number.isNaN(parsedDate.getTime()) && toUtcDateString(parsedDate) === value
  );
};

// `undefined` means the field was left out of the request body.
export const isOptionalDate = (value: unknown) =>
  value === undefined || value === null || isDateString(value);

export const getTodayDateString = () => toUtcDateString(new Date());
