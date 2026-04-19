import { Template, TextZone } from '@/types/template';

// Backend API response shape
export interface BackendTemplate {
  id: string; // UUID
  name: string;
  category: string;
  imageUrl: string;
  width: number;
  height: number;
  textZones: Array<{
    id: string;
    x: number;
    y: number;
    font_family: string;
    font_size: number;
    color: string;
    width?: number;
    height?: number;
    default_text: string;
    label: string;
    shadow: boolean;
  }>;
}

/** Map backend TemplateResponse to frontend Template. */
function backendToFrontend(bt: BackendTemplate): Template {
  const textZones: TextZone[] = bt.textZones.map((tz) => ({
    id: tz.id,
    label: tz.label || tz.id,
    defaultText: tz.default_text || '',
    x: tz.x / 100, // backend uses 0-100%, frontend uses 0-1
    y: tz.y / 100,
    fontSize: tz.font_size,
    fontFamily: tz.font_family,
    color: tz.color,
    align: 'center',
    maxWidth: tz.width ? tz.width / bt.width : 0.8,
    shadow: tz.shadow,
  }));

  return {
    id: bt.id, // use UUID as id for backend-sourced templates
    backendId: bt.id,
    name: bt.name,
    category: bt.category,
    emoji: '🎨',
    width: bt.width,
    height: bt.height,
    background: {
      type: 'gradient',
      value: `url(${bt.imageUrl})`,
    },
    textZones,
  };
}

/** Fetch all templates from backend API. */
export async function fetchTemplates(): Promise<BackendTemplate[]> {
  const res = await fetch('/api/templates/');
  if (!res.ok) throw new Error(`Failed to fetch templates: ${res.status}`);
  return res.json();
}

/**
 * Merge backend templates with local frontend data.
 * Backend is the source of truth for "what exists".
 * Local data provides visual enrichment (emoji, background, decorations).
 */
export function mergeTemplates(
  backend: BackendTemplate[],
  local: Template[],
): Template[] {
  // Index local templates by backendId for fast lookup
  const localByBackendId = new Map<string, Template>();
  for (const t of local) {
    if (t.backendId) localByBackendId.set(t.backendId, t);
  }

  const result: Template[] = [];
  for (const bt of backend) {
    const localData = localByBackendId.get(bt.id);
    if (localData) {
      // Use full local data (emoji, decorations, custom background)
      result.push(localData);
    } else {
      // Backend-only template — create minimal frontend representation
      result.push(backendToFrontend(bt));
    }
  }

  return result;
}

/** Fetch a single template by UUID or slug from backend. */
export async function fetchTemplateById(id: string): Promise<BackendTemplate | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const endpoint = isUuid ? `/api/templates/${id}` : `/api/templates/by-slug/${id}`;
    const res = await fetch(endpoint);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Fetch available categories from backend. */
export async function fetchCategories(): Promise<string[]> {
  const res = await fetch('/api/templates/categories');
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return res.json();
}
