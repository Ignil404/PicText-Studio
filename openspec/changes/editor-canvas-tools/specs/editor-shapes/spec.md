# Editor Shapes Spec

## Overview

Инструменты фигур для editor.

## Data Model

### ShapeBlock (Frontend)

```typescript
interface ShapeBlock {
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
```

### ShapeBlock (Backend)

```python
class ShapeBlock(BaseModel):
    id: str
    type: Literal["rectangle", "circle", "line", "arrow"]
    x: float
    y: float
    width: float | None = None
    height: float | None = None
    color: str = "#000000"
    filled: bool = False
    stroke_width: int = 2
```

## UI

- Shape toolbar: rectangle, circle, line, arrow иконки
- Color picker (preset colors + custom)
- Filled/outline toggle
- Stroke width slider (1-10)

## Render

### Frontend (Canvas 2D)

- Rectangle: `ctx.strokeRect()`, `ctx.fillRect()`
- Circle: `ctx.arc()` + stroke/fill
- Line: `ctx.moveTo()`, `ctx.lineTo()`
- Arrow: Line + triangle head

### Backend (PIL)

- Rectangle: `ImageDraw.rectangle()`
- Circle: `ImageDraw.ellipse()`
- Line: `ImageDraw.line()`
- Arrow: Line + polygon для arrowhead