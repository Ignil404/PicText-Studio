## ADDED Requirements

### Requirement: Image Rendering
The system SHALL render text blocks onto a template image using Pillow and return the rendered image URL.

#### Scenario: Successful render
- **WHEN** client sends `POST /api/render` with valid `template_id`, `text_blocks`, and `format`
- **THEN** the system returns `200 OK` with `{ "image_url": "/api/rendered/<uuid>.png" }`
- **AND** the rendered image is saved to `rendered_images/`
- **AND** the render is recorded in history

#### Scenario: Template not found
- **WHEN** client sends `POST /api/render` with a non-existent `template_id`
- **THEN** the system returns `404 Not Found` with `{"detail": "Template not found"}`

#### Scenario: Invalid request body
- **WHEN** client sends `POST /api/render` with missing fields in the body
- **THEN** the system returns `422 Unprocessable Entity` with Field detail errors

### Requirement: Render Pipeline
The render pipeline SHALL:

1. Validate the request against Pydantic schema
2. Look up the template by ID from the database
3. Open the template image via `PIL.Image.open(template.image_path)`
4. For each `text_block`, draw text at `(x, y)` using `ImageDraw` and `ImageFont.truetype()`
5. Apply `bold` (font variant) and `italic` (style flag) when supported
6. Resolve font filenames from a font registry mapping `font_family` → filename
7. Save the result as PNG or JPEG per the `format` field
8. Store the image in `rendered_images/` with a UUID4 filename
9. Return the public URL path

### Requirement: Request/Response Schema

**POST /api/render** request body:
```json
{
  "session_id": "string (UUID)",
  "template_id": "string (UUID)",
  "text_blocks": [
    {
      "id": "string",
      "text": "string",
      "x": "number",
      "y": "number",
      "font_family": "string",
      "font_size": "integer",
      "color": "string (hex or named)",
      "bold": "boolean",
      "italic": "boolean"
    }
  ],
  "format": "png | jpeg"
}
```

Response:
```json
{ "image_url": "string" }
```
