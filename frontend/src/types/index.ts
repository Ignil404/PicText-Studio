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
  template_id: string;
  text_elements: Omit<TextElement, 'id'>[];
  format: 'png' | 'jpeg';
}

export interface RenderResponse {
  image_url: string;
}

export interface ApiError {
  detail: string;
}
