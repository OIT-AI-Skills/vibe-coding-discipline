// Formats a UTC ISO timestamp as a local date string for a given city.
// BUG REPORT: Users in Sydney see events on the wrong day.

const CITY_OFFSETS = {
  "New York": -5,
  "London": 0,
  "Sydney": 10,
};

/**
 * @param {string} isoUtc - e.g. "2026-01-15T18:30:00Z"
 * @param {string} city - e.g. "Sydney"
 * @returns {string} e.g. "January 16, 2026"
 */
export function formatEventDate(isoUtc, city) {
  const utc = new Date(isoUtc);
  const offsetHours = CITY_OFFSETS[city] ?? 0;

  // Shift the timestamp by the city's offset to get local time
  const local = new Date(utc.getTime() + offsetHours * 60 * 60 * 1000);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return `${months[local.getUTCMonth()]} ${local.getUTCDate()}, ${local.getUTCFullYear()}`;
}
