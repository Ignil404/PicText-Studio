import { useState } from 'react';
import { stickers, STICKER_CATEGORIES } from '@/data/stickers';

interface StickerPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}

export const StickerPicker = ({ onSelect, onClose }: StickerPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const displayedStickers = selectedCategory === 'all'
    ? stickers
    : stickers.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-3">
      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-muted rounded-lg"
        >
          ✕
        </button>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-2 py-1 rounded-full text-xs ${
            selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          Все
        </button>
        {STICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2 py-1 rounded-full text-xs ${
              selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Stickers grid */}
      <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
        {displayedStickers.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            onClick={() => onSelect(sticker.emoji)}
            className="aspect-square flex items-center justify-center text-xl hover:bg-muted rounded-lg transition-colors"
          >
            {sticker.emoji}
          </button>
        ))}
      </div>
      {displayedStickers.length === 0 && (
        <p className="text-sm text-muted-foreground">Стикеры не найдены</p>
      )}
    </div>
  );
};

export default StickerPicker;