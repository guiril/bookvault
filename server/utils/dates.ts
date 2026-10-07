const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// `new Date('2026-02-30')` silently rolls over to March 2nd, so the parsed
// date is converted back and compared to reject days that don't exist.
export const isDateString = (value: unknown): value is string => {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;

  const parsedDate = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  );
};

export const getTodayDateString = () => new Date().toISOString().slice(0, 10);
