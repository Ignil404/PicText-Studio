/** Client-side session ID (UUID v4) persisted in localStorage. */
const KEY = "session_id";

export function getSessionId(): string {
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

export function resetSessionId(): string {
  const sid = crypto.randomUUID();
  localStorage.setItem(KEY, sid);
  return sid;
}
