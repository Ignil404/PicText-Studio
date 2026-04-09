import type { Template, RenderRequest, HistoryEntry } from '../types';
import { getSessionId } from '../lib/session';

const API_BASE = '/api';

// ── Templates ──────────────────────────────────────────────

export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch(`${API_BASE}/templates/`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function fetchTemplateById(id: string): Promise<Template | undefined> {
  const res = await fetch(`${API_BASE}/templates/${id}/`);
  if (!res.ok) {
    if (res.status === 404) return undefined;
    throw new Error(`Failed to fetch template: ${res.status}`);
  }
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/templates/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

// ── History ────────────────────────────────────────────────

export async function fetchHistory(sessionId: string): Promise<HistoryEntry[]> {
  const res = await fetch(`${API_BASE}/history/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

// ── Render ─────────────────────────────────────────────────

let renderAbortController: AbortController | null = null;

export async function renderImage(
  request: Omit<RenderRequest, 'session_id'> & { session_id?: string },
  signal?: AbortSignal,
): Promise<Blob> {
  if (renderAbortController) {
    renderAbortController.abort();
  }
  renderAbortController = new AbortController();
  const effectiveSignal = signal ?? renderAbortController.signal;

  const body = {
    ...request,
    session_id: request.session_id ?? getSessionId(),
  };

  const res = await fetch(`${API_BASE}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: effectiveSignal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new RenderError(error.detail ?? `Render failed: ${res.status}`, res.status);
  }

  return res.blob();
}

export function cancelRender(): void {
  if (renderAbortController) {
    renderAbortController.abort();
    renderAbortController = null;
  }
}

// ── Errors ─────────────────────────────────────────────────

export class RenderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'RenderError';
  }
}
