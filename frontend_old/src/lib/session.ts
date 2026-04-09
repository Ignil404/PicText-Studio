const STORAGE_KEY = 'session_id';

/**
 * Returns a persistent session ID.
 * - On first visit: generates a UUID via crypto.randomUUID() and persists in localStorage.
 * - On returning visits: returns the existing value from localStorage.
 * - If localStorage is unavailable: generates a fresh UUID on each call (no persistence).
 */
export function getSessionId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
    const fresh = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // localStorage unavailable (private mode, disabled, etc.)
    return crypto.randomUUID();
  }
}
