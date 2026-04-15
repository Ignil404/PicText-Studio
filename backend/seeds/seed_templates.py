"""Seed script: 15 beautiful templates with gradient backgrounds and text on preview.

Uses SQLAlchemy async session (not raw asyncpg) for consistency with the rest of the app.
"""

import asyncio
import base64
import os
import uuid

from database import async_session_factory
from logger import get_logger
from models import Template

logger = get_logger(__name__)

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise RuntimeError("DATABASE_URL environment variable is required.")


def _esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def gradient_svg(
    w: int,
    h: int,
    colors: list[str],
    angle: float = 135,
    preview_zones: list[dict] | None = None,
) -> str:
    """SVG with gradient fill + text zones rendered on the preview image."""
    grad = (
        '<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">'
        + "".join(
            f'<stop offset="{i / (len(colors) - 1) * 100:.0f}%" stop-color="{c}"/>'
            for i, c in enumerate(colors)
        )
        + "</linearGradient>"
    )

    text_svg = ""
    if preview_zones:
        for z in preview_zones:
            lines = z.get("default_text", "").split("\n")
            x = z["x"]
            y = z["y"]
            fs = z["font_size"]
            lh = fs * 1.3
            start_y = y - ((len(lines) - 1) * lh) / 2
            for i, line in enumerate(lines):
                extra = ""
                if z.get("shadow"):
                    sw = max(2, fs // 10)
                    extra = (
                        ' style="paint-order:stroke;'
                        f"stroke:#000;stroke-width:{sw}px;"
                        'stroke-linecap:round;stroke-linejoin:round"'
                    )
                text_svg += (
                    f'<text x="{x}" y="{start_y + i * lh}" '
                    f'fill="{z.get("color", "#ffffff")}" '
                    f'font-family="{z.get("font_family", "sans-serif")}" '
                    f'font-size="{fs}" text-anchor="middle" dominant-baseline="middle"{extra}>'
                    f"{_esc(line)}</text>"
                )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}">'
        f'{grad}<rect width="100%" height="100%" fill="url(#g)"/>'
        f"{text_svg}"
        f"</svg>"
    )
    return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"


def tz(
    id: str,
    x: float,
    y: float,
    font_family: str,
    font_size: int,
    color: str,
    default_text: str = "",
    label: str = "",
    width: int | None = None,
    height: int | None = None,
    shadow: bool = False,
) -> dict:
    """Shorthand for a text zone (both preview + actual zone data)."""
    return {
        "id": id,
        "x": x,
        "y": y,
        "font_family": font_family,
        "font_size": font_size,
        "color": color,
        "default_text": default_text,
        "label": label or id.replace("_", " ").title(),
        "width": width,
        "height": height,
        "shadow": shadow,
    }


def make_template(
    uid: int,
    name: str,
    category: str,
    w: int,
    h: int,
    colors: list[str],
    angle: float,
    text_zones: list[dict],
) -> dict:
    """Build a template dict — text_zones rendered on preview image."""
    preview_zones = []
    for z in text_zones:
        preview_zones.append(z)
    return {
        "id": uuid.UUID(f"10000000-0001-0001-0001-{uid:012d}"),
        "name": name,
        "category": category,
        "image_path": gradient_svg(w, h, colors, angle, preview_zones=preview_zones),
        "width": w,
        "height": h,
        "text_zones": text_zones,
    }


# mypy: disable-error-code="type-arg"
# fmt: off
TEMPLATES = [
    # === MOTIVATION ===
    make_template(1, "Восход успеха", "motivation", 1080, 1080,
        ["#667eea", "#f093fb", "#f5576c"], 135, [
            tz("title", 540, 388, "Fredoka", 72, "#ffffff", "ВЕРЬ В СЕБЯ", shadow=True),
            tz("subtitle", 540, 648, "Nunito", 32, "#ffffff", "Каждый день — новый шанс"),
        ]),
    make_template(2, "Сила воли", "motivation", 1080, 1080,
        ["#0f0c29", "#302b63", "#24243e"], 180, [
            tz("title", 540, 378, "Impact", 80,
               "#ff6b6b", "НЕ СДАВАЙСЯ", shadow=True),
            tz("subtitle", 540, 648, "Comfortaa", 28,
               "#e0e0e0", "Боль временна, гордость — навсегда"),
        ]),
    make_template(3, "Мечтай громко", "motivation", 1080, 1350,
        ["#a18cd1", "#fbc2eb", "#f6d365"], 160, [
            tz("title", 540, 572, "Pacifico", 76, "#2d1b69", "МЕЧТАЙ\nГРОМЧЕ", shadow=True),
            tz("subtitle", 540, 877, "Nunito", 30, "#4a2d8a", "Небо — это не предел 🚀"),
        ]),

    # === DEMOTIVATORS ===
    make_template(4, "Классический демотиватор", "demotivator", 1080, 1080,
        ["#000000", "#111111"], 135, [
            tz("title", 540, 400, "Impact", 64, "#ffffff", "РАБОТА"),
            tz("subtitle", 540, 972, "Nunito", 24, "#cccccc",
               "Не волк, в лес не убежит.\nА вот ты можешь."),
        ]),
    make_template(5, "Современный демотиватор", "demotivator", 1080, 1080,
        ["#1a1a2e", "#16213e", "#0f3460"], 135, [
            tz("title", 540, 432, "Impact", 64, "#e94560", "ПОНЕДЕЛЬНИК", shadow=True),
            tz("subtitle", 540, 648, "Comfortaa", 26, "#a0a0b0", "Ничего личного, просто бизнес"),
        ]),

    # === GREETINGS ===
    make_template(6, "С Днём Рождения!", "greeting", 1080, 1080,
        ["#f093fb", "#f5576c", "#ffd89b"], 135, [
            tz("title", 540, 328, "Lobster", 68, "#ffffff", "С ДНЁМ\nРОЖДЕНИЯ!", shadow=True),
            tz("name", 540, 598, "Caveat", 36, "#fff3e0", "Дорогой друг!"),
            tz("wish", 540, 842, "Nunito", 24, "#ffffff", "Пусть каждый день приносит радость! 🎉"),
        ]),
    make_template(7, "С Новым Годом!", "greeting", 1080, 1080,
        ["#0a1628", "#1a237e", "#283593"], 180, [
            tz("title", 540, 382, "Pacifico", 72,
               "#ffd700", "С НОВЫМ\nГОДОМ!", shadow=True),
            tz("subtitle", 540, 734, "Comfortaa", 26,
               "#e8eaf6", "Счастья, здоровья и исполнения желаний! ✨"),
        ]),
    make_template(8, "С любовью", "greeting", 1080, 1080,
        ["#ee9ca7", "#ffdde1", "#f8b500"], 135, [
            tz("title", 540, 382, "Satisfy", 64, "#8b0000", "Ты — моё\nвсё ❤️", shadow=True),
            tz("subtitle", 540, 702, "Caveat", 28, "#6b0000", "С любовью и нежностью"),
        ]),

    # === MEMES ===
    make_template(9, "Импакт мем", "meme", 1080, 1080,
        ["#00b4db", "#0083b0"], 180, [
            tz("top", 540, 80, "Impact", 52,
               "#ffffff", "КОГДА НАПИСАЛ КОД", shadow=True),
            tz("bottom", 540, 1000, "Impact", 48,
               "#ffffff", "И ОН ЗАРАБОТАЛ\nС ПЕРВОГО РАЗА", shadow=True),
        ]),
    make_template(10, "Жизненный мем", "meme", 1080, 1350,
        ["#f7971e", "#ffd200"], 135, [
            tz("setup", 540, 520, "Fredoka", 40,
               "#333333", "Я: сегодня лягу пораньше"),
            tz("punchline", 540, 945, "Fredoka", 44,
               "#333333", "Также я в 3 часа ночи:", shadow=True),
        ]),
    make_template(15, "Когда всё по плану", "meme", 1080, 1080,
        ["#a1c4fd", "#c2e9fb"], 135, [
            tz("top", 540, 80, "Impact", 52,
               "#ffffff", "КОГДА ВСЁ ИДЁТ ПО ПЛАНУ", shadow=True),
            tz("bottom", 540, 1000, "Impact", 48,
               "#ffffff", "А САМ ОТКРЫЛ НЕТФЛИКС", shadow=True),
        ]),

    # === QUOTES ===
    make_template(11, "Минималистичная цитата", "quote", 1080, 1080,
        ["#ffecd2", "#fcb69f"], 135, [
            tz("quote", 540, 404, "Caveat", 44, "#4a3728",
               "«Будь тем изменением,\n"
               "которое хочешь\n"
               "увидеть в мире»"),
            tz("author", 540, 778, "Comfortaa", 24,
               "#7a5f50", "— Махатма Ганди"),
        ]),
    make_template(12, "Тёмная цитата", "quote", 1080, 1350,
        ["#141e30", "#243b55"], 180, [
            tz("quote", 540, 540, "Satisfy", 42, "#e8d5b7",
               "«Тот, кто двигает горы,\n"
               "начинает с того,\n"
               "что убирает\n"
               "маленькие камни»", shadow=True),
            tz("author", 540, 945, "Comfortaa", 22,
               "#a89070", "— Конфуций"),
        ]),

    # === REACTIONS ===
    make_template(13, "Этот мем — ты", "reaction", 1080, 1080,
        ["#fc5c7d", "#6a82fb"], 135, [
            tz("top", 540, 350, "Impact", 48, "#ffffff",
               "КОГДА ГОВОРИШЬ\n«СЕЙЧАС СДЕЛАЮ»", shadow=True),
            tz("bottom", 540, 930, "Impact", 48,
               "#ffffff", "А САМ ОТКРЫЛ НЕТФЛИКС", shadow=True),
        ]),
    make_template(14, "Ожидание vs Реальность", "reaction", 1080, 1080,
        ["#ff9a9e", "#fecfef", "#fad0c4"], 135, [
            tz("expectation", 540, 400, "Fredoka", 44, "#333333", "ОЖИДАНИЕ", shadow=True),
            tz("reality", 540, 750, "Fredoka", 44, "#333333", "РЕАЛЬНОСТЬ", shadow=True),
        ]),
]
# fmt: on


async def seed(*, force: bool = True) -> None:
    """Seed templates into the database.

    Args:
        force: If False, skip seeding when templates already exist (idempotent mode).
    """
    async with async_session_factory() as session:
        # Check existing count for idempotent mode
        if not force:
            result = await session.execute(Template.__table__.select())
            if result.scalar() is not None:  # any row exists
                logger.info("Templates already seeded, skipping")
                return

        # Clear existing data and re-seed
        await session.execute(Template.__table__.delete())
        await session.commit()

        # Insert templates
        for t in TEMPLATES:
            template = Template(
                id=t["id"],
                name=t["name"],
                category=t["category"],
                image_path=t["image_path"],
                width=t["width"],
                height=t["height"],
                text_zones=t["text_zones"],
            )
            session.add(template)

        await session.commit()
        logger.info(f"Seeded {len(TEMPLATES)} templates")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed template database")
    parser.add_argument("--once", action="store_true", help="Skip if templates already exist")
    args = parser.parse_args()

    asyncio.run(seed(force=not args.once))
