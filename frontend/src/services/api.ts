import type { Template, RenderRequest } from '../types';

const API_BASE = '/api';

function svgPlaceholder(w: number, h: number, bg: string, fg: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="${bg}"/>
    <text x="50%" y="50%" fill="${fg}" font-family="sans-serif" font-size="${Math.floor(h/8)}"
          text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Mock data — replace with real fetch when backend endpoints exist
const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Drake Hotline',
    category: 'reaction',
    imageUrl: svgPlaceholder(600, 600, '#dc2626', '#ffffff', 'Drake Hotline'),
    width: 600,
    height: 600,
  },
  {
    id: 't2',
    name: 'Distracted Boyfriend',
    category: 'classic',
    imageUrl: svgPlaceholder(800, 533, '#2563eb', '#ffffff', 'Distracted Boyfriend'),
    width: 800,
    height: 533,
  },
  {
    id: 't3',
    name: 'Two Buttons',
    category: 'decision',
    imageUrl: svgPlaceholder(680, 600, '#16a34a', '#ffffff', 'Two Buttons'),
    width: 680,
    height: 600,
  },
];

export async function fetchTemplates(): Promise<Template[]> {
  // TODO: swap to real API when backend has GET /api/templates
  // const res = await fetch(`${API_BASE}/templates`);
  // if (!res.ok) throw new Error('Failed to fetch templates');
  // return res.json();
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_TEMPLATES;
}

export async function fetchTemplateById(id: string): Promise<Template | undefined> {
  const templates = await fetchTemplates();
  return templates.find((t) => t.id === id);
}

let renderAbortController: AbortController | null = null;

export async function renderImage(
  request: RenderRequest,
  signal?: AbortSignal,
): Promise<Blob> {
  if (renderAbortController) {
    renderAbortController.abort();
  }
  renderAbortController = new AbortController();
  const effectiveSignal = signal ?? renderAbortController.signal;

  const res = await fetch(`${API_BASE}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: effectiveSignal,
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({ detail: `HTTP ${res.status}` })));
    throw new Error(error.detail ?? `Render failed: ${res.status}`);
  }

  return res.blob();
}

export function cancelRender(): void {
  if (renderAbortController) {
    renderAbortController.abort();
    renderAbortController = null;
  }
}
