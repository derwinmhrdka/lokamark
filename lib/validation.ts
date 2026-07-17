/** Practical email format check (not full RFC). Requires local@domain.tld */
export function isValidEmail(email: string) {
  const value = email.trim()
  if (!value || value.length > 254) return false
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)
}

/** Letters, numbers, underscore, dot, hyphen; 3–32 chars */
export function isValidUsername(username: string) {
  return /^[a-zA-Z0-9._-]{3,32}$/.test(username.trim())
}
