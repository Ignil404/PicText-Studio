export type TemplateCategory = 'motivation' | 'demotivator' | 'greeting' | 'meme' | 'quote';

export interface TextZone {
  id: string;
  label: string;
  defaultText: string;
  x: number; // 0-1 relative
  y: number; // 0-1 relative
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  maxWidth: number; // 0-1 relative
  bold?: boolean;
  italic?: boolean;
  shadow?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  emoji: string;
  width: number;
  height: number;
  background: TemplateBackground;
  textZones: TextZone[];
  decorations?: Decoration[];
}

export interface TemplateBackground {
  type: 'gradient' | 'solid' | 'pattern';
  value: string; // CSS gradient, color, or pattern definition
}

export interface Decoration {
  type: 'emoji' | 'shape' | 'line';
  value: string;
  x: number;
  y: number;
  size: number;
  rotation?: number;
  opacity?: number;
}

export interface EditorState {
  templateId: string;
  texts: Record<string, string>;
  customizations: Record<string, TextCustomization>;
  customBackground?: string; // data URL or uploaded image
}

export interface TextCustomization {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  x?: number;
  y?: number;
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  motivation: '💪 Мотивация',
  demotivator: '😈 Демотиваторы',
  greeting: '🎉 Открытки',
  meme: '😂 Мемы',
  quote: '✨ Цитаты',
};

export const AVAILABLE_FONTS = [
  { name: 'Nunito', label: 'Nunito' },
  { name: 'Pacifico', label: 'Pacifico' },
  { name: 'Lobster', label: 'Lobster' },
  { name: 'Caveat', label: 'Caveat' },
  { name: 'Permanent Marker', label: 'Permanent Marker' },
  { name: 'Satisfy', label: 'Satisfy' },
  { name: 'Comfortaa', label: 'Comfortaa' },
  { name: 'Rubik Mono One', label: 'Rubik Mono One' },
  { name: 'Fredoka', label: 'Fredoka' },
  { name: 'Inter', label: 'Inter' },
];
