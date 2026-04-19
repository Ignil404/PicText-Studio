import { useState } from 'react';
import { stickers, STICKER_CATEGORIES, getStickersByCategory, searchStickers, Sticker } from '@/data/stickers';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface StickerPickerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelect: (emoji: string) => void;
}

export const StickerPicker = ({ isOpen = true, onClose, onSelect }: StickerPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const displayedStickers = searchQuery
    ? searchStickers(searchQuery)
    : getStickersByCategory(selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-background rounded-t-2xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Стикеры</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск стикеров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-2 overflow-x-auto flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Все
          </button>
          {STICKER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Stickers grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {displayedStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => {
                  onSelect(sticker.emoji);
                  onClose?.();
                }}
                className="aspect-square flex items-center justify-center text-2xl hover:bg-muted rounded-lg transition-colors"
              >
                {sticker.emoji}
              </button>
            ))}
          </div>
          {displayedStickers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Ничего не найдено
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickerPicker;