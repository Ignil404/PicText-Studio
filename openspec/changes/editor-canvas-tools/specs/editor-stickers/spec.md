# Editor Stickers Spec

## Overview

Добавление emoji-стикеров в editor.

## Data Model

### StickerBlock (Frontend)

```typescript
interface StickerBlock {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number; // 24-120
}
```

### StickerBlock (Backend)

```python
class StickerBlock(BaseModel):
    id: str
    emoji: str
    x: float
    y: float
    size: int = 48
```

## API

### Render Request

```python
class RenderRequest(BaseModel):
    sticker_blocks: list[StickerBlock] = []
```

## UI

- StickerPicker: категории (smileys, animals, food, sports, etc.)
- Selected sticker добавляется по центру canvas
- drag для позиционирования
- size slider в toolbar

## Render

- Frontend: `ctx.fillText(emoji, x, y)` с font size
- Backend: PIL `ImageFont` + `ImageDraw.text`