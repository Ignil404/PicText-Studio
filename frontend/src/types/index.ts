export interface Template {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  width: number;
  height: number;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
}

export interface RenderRequest {
  session_id: string;
  template_id: string;
  text_blocks: Omit<TextElement, 'id'>[];
  format: 'png' | 'jpeg';
}

export interface RenderResponse {
  image_url: string;
}

export interface RenderHistoryEntry {
  id: string;
  template_id: string;
  template_name: string;
  text_blocks: Omit<TextElement, 'id'>[];
  image_url: string;
  created_at: string;
}

export type HistoryEntry = RenderHistoryEntry;

export interface ApiError {
  detail: string;
}
