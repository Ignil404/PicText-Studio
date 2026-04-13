/** Client-side session ID (UUID v4) persisted in localStorage with cookie fallback. */
const KEY = "session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2] ?? null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value};max-age=${maxAge};path=/;SameSite=Strict`;
}

export function getSessionId(): string {
  // Try localStorage first
  let sid = localStorage.getItem(KEY);

  // Fallback to cookie
  if (!sid) {
    sid = getCookie(KEY);
  }

  // Generate new if still missing
  if (!sid) {
    sid = crypto.randomUUID();
  }

  // Persist to both
  localStorage.setItem(KEY, sid);
  setCookie(KEY, sid, COOKIE_MAX_AGE);

  return sid;
}

export function resetSessionId(): string {
  const sid = crypto.randomUUID();
  localStorage.setItem(KEY, sid);
  setCookie(KEY, sid, COOKIE_MAX_AGE);
  return sid;
}
