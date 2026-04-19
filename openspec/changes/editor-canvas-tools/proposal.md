## Why

Editor не поддерживает stickers и shapes на canvas preview — пользователи видят только текстовые блоки, но не могут добавить стикеры или фигуры. Это ограничивает креативность и делает editor менее функциональным.

## What Changes

- **Stickers**: Рендер стикеров (эмодзи) на canvas preview
- **Shapes**: Инструменты для добавления фигур (rectangle, circle, line, arrow) на canvas
- Завершить недоработанные задачи из feature-enhancements

## Capabilities

### New Capabilities
- `editor-stickers`: Отображение и рендер emoji-стикеров на canvas
- `editor-shapes`: Инструменты фигур (rectangle, circle, line, arrow)

### Modified Capabilities
- `editor-render`: Добавить поддержку стикеров и фигур в server-side render

## Impact

Frontend: CanvasPreview.tsx, EditorPanel.tsx, StickerPicker.tsx
Backend: render_service.py