export type TemplateCategory = 'motivation' | 'demotivator' | 'greeting' | 'meme' | 'quote' | 'reaction' | 'classic' | 'decision' | 'opinion' | 'escalation';

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
  backendId?: string;  // UUID for server render
  name: string;
  category: string;
  emoji: string;
  width: number;
  height: number;
  background: TemplateBackground;
  textZones: TextZone[];
  decorations?: Decoration[];
}

export interface TemplateBackground {
  type: 'gradient' | 'solid' | 'pattern';
  value: string;
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

export interface TextCustomization {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  x?: number;
  y?: number;
}

export const CATEGORY_LABELS: Record<string, string> = {
  motivation: '💪 Мотивация',
  demotivator: '😈 Демотиваторы',
  greeting: '🎉 Открытки',
  meme: '😂 Мемы',
  quote: '✨ Цитаты',
  reaction: '🤣 Реакции',
  classic: '🎭 Классика',
  decision: '🤔 Выбор',
  opinion: '💬 Мнение',
  escalation: '📈 Эскалация',
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
