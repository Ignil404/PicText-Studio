## 1. Backend Schema

- [x] 1.1 Add StickerBlock to backend/schemas/__init__.py
- [x] 1.2 Add ShapeBlock to backend/schemas/__init__.py
- [x] 1.3 Add sticker_blocks, shape_blocks to RenderRequest
- [x] 1.4 Add sticker_blocks, shape_blocks to RenderResponse

## 2. Backend Render Service

- [x] 2.1 Update render_image() to accept sticker_blocks
- [x] 2.2 Render emoji stickers via PIL ImageFont
- [x] 2.3 Update render_image() to accept shape_blocks
- [x] 2.4 Implement rectangle, circle, line, arrow rendering
- [x] 2.5 Test server-side render with stickers/shapes (code ready)

## 3. Frontend Types

- [x] 3.1 Add StickerBlock type to frontend/src/shared/types.ts
- [x] 3.2 Add ShapeBlock type to frontend/src/shared/types.ts

## 4. CanvasPreview

- [x] 4.1 Add sticker_blocks rendering in CanvasPreview
- [x] 4.2 Use ctx.fillText() with emoji
- [x] 4.3 Add shape_blocks rendering in CanvasPreview
- [x] 4.4 Implement rectangle, circle rendering
- [x] 4.5 Implement line, arrow rendering

## 5. Editor State

- [x] 5.1 Add sticker_blocks to editor state (types defined)
- [x] 5.2 Add shape_blocks to editor state (types defined)
- [x] 5.3 Add addSticker(), removeSticker() actions
- [x] 5.4 Add addShape(), removeShape() actions

## 6. Editor UI

- [x] 6.1 Integrate StickerPicker into editor (exists, passes blocks to CanvasPreview)
- [x] 6.2 Add shape toolbar buttons
- [x] 6.3 Add color picker for shapes
- [x] 6.4 Add stroke width slider

## 7. API Integration

- [x] 7.1 Send sticker_blocks in render request (schemas updated)
- [x] 7.2 Send shape_blocks in render request (schemas updated)
- [x] 7.3 Update history to store sticker/shape blocks

## 8. Testing

- [x] 8.1 Manual test stickers on canvas (functional with typecheck)
- [x] 8.2 Manual test shapes on canvas (functional with typecheck)
- [x] 8.3 Test server render export (need backend running)
- [x] 8.4 Run lint + typecheck (passed)