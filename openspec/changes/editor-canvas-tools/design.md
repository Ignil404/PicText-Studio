## Context

Editor использует HTML5 Canvas для live preview. Текущая реализация:
- `CanvasPreview.tsx` — рендерит текстовые блоки с фоном и шрифтами
- `StickerPicker.tsx` — компонент выбора стикеров (есть данные в stickers.ts)
- `EditorPanel.tsx` — toolbar с tools (text, stickers, shapes, filters)

Текущее ограничение: stickers и shapes не рендерятся на canvas, только текст.

## Goals / Non-Goals

**Goals:**
- Рендер emoji-стикеров на canvas preview
- Рендер фигур (rectangle, circle, line, arrow) на canvas preview
- Поддержка в server-side render для экспорта

**Non-Goals:**
- Drag-and-drop позиционирование (базовое позиционирование достаточно)
- Анимации стикеров/фигур
- Сложные трансформации (rotate, scale)

## Decisions

### 1. Stickers rendering

**Decision**: Рендерить emoji как Unicode-символы через `ctx.fillText()`

**Rationale**: 
- Emoji уже есть в stickers.ts (50 штук)
- Не требует дополнительных библиотек
- Server-side: Pillow поддерживает Unicode text

**Alternative**: Использовать изображение → требует конвертации, больше хранилища

### 2. Shapes rendering

**Decision**: Canvas 2D API для rectangle/circle, paths для line/arrow

**Rationale**: 
- Canvas 2D API нативный, быстрый
- Легко экспортировать в server-side (PIL.ImageDraw)

**Alternative**: SVG → сложнее синхронизировать canvas preview и server render

### 3. Data model

**Decision**: Добавить `sticker_blocks` и `shape_blocks` в RenderRequest

```typescript
interface StickerBlock {
  emoji: string;
  x: number;
  y: number;
  size: number;
}

interface ShapeBlock {
  type: 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  filled: boolean;
}
```

**Rationale**: Аналогично text_blocks, простая расширяемость

## Risks / Trade-offs

- [Risk] Эмодзи могут выглядеть по-разному на разных ОС → [Mitigation] Использовать системные emoji, document fallback
- [Risk] Server render может не поддерживать все фигуры → [Mitigation] PIL.ImageDraw поддерживает все базовые фигуры