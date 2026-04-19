## Why

Пользователи хотят делиться созданными картинками напрямую в соцсетях, но сейчас нужно копировать ссылку и вставлять вручную. Нужен удобный one-click sharing.

## What Changes

- Share modal с кнопками Telegram, VK, WhatsApp
- Прямые ссылки на соцсети с preview image
- Web Share API для мобильных

## Capabilities

### New Capabilities
- `social-share`: Share modal с кнопками соцсетей

### Modified Capabilities
- `shared-images`: Добавить preview image

## Impact

Frontend: ShareButton → ShareModal
Backend: og:image endpoint