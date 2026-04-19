## Context

Текущий flow: пользователь нажимает "Поделиться" → получает ссылку → копирует → вставляет в соцсеть.
Ручной процесс, нет preview изображения.

## Goals / Non-Goals

**Goals:**
- Кнопки Telegram, VK, WhatsApp, Twitter
- Preview image в постах
- Web Share API для мобильных

**Non-Goals:**
- OAuth авторизация через соцсети
- Отправка файлов напрямую (только ссылки)

## Decisions

### 1. Share URLs vs Web Share API

**Decision**: Share URLs + Web Share API fallback

**Rationale**: 
- Telegram/VK поддерживают ссылки с preview
- Web Share API — нативный, работает везде
- Проще реализовать

### 2. Preview Image Format

**Decision**: OG:image через `/shared/{id}/embed`

**Rationale**:
- Уже есть embed endpoint
- Соцсети парсят og:image
- Не нужно создавать отдельный endpoint

### 3. Share Text

**Decision**: Шаблонное сообщение "Создал картинку в PicText: {url}"

**Rationale**:
- Telegram/VK подхватывают URL и делают preview автоматически

## Share URLs Format

```
Telegram: https://t.me/share/url?url={share_url}
VK: https://vk.com/share.php?url={share_url}
WhatsApp: https://wa.me/?text={text}%20{url}
Twitter: https://twitter.com/intent/tweet?url={url}&text={text}
```

## Trade-offs

- [Risk] Preview может не отображаться если OG теги не парсятся → [Mitigation] Использовать Web Share API fallback
- [Risk] Длинные URL → [Mitigation] Использовать shortener если нужен