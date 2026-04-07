import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSessionId } from './session';

const STORAGE_KEY = 'session_id';

describe('getSessionId', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.restoreAllMocks();

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generates a new UUID on first visit and persists it', () => {
    const id = getSessionId();

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    // Validates UUID v4 format
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, id);
  });

  it('returns the existing value on returning visits', () => {
    const existingId = '550e8400-e29b-41d4-a716-446655440000';
    store[STORAGE_KEY] = existingId;

    const id = getSessionId();

    expect(id).toBe(existingId);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('generates a fresh UUID when localStorage is unavailable', () => {
    // Stub localStorage to throw
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('quota exceeded');
      }),
      setItem: vi.fn(() => {
        throw new Error('quota exceeded');
      }),
    });

    const id1 = getSessionId();
    const id2 = getSessionId();

    expect(id1).toBeDefined();
    expect(typeof id1).toBe('string');
    expect(id1).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    // Each call generates a fresh UUID when localStorage fails
    expect(id1).not.toBe(id2);
  });
});
