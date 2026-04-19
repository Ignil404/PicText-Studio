// ExportOptions type - used at compile time only
export type ExportOptions = {
  format: 'png' | 'jpeg' | 'webp';
  quality: 'low' | 'medium' | 'high' | 'lossless';
  resolution: 'sd' | 'hd' | '4k';
};

// Sticker block for canvas
export interface StickerBlock {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

// Shape block for canvas
export interface ShapeBlock {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  filled: boolean;
  strokeWidth: number;
}