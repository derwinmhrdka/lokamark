/** Current UTC timestamp in ISO-8601 (Airtable date+time compatible). */
export function nowDateTime() {
  return new Date().toISOString()
}
