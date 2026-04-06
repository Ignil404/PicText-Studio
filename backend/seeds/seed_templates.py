"""Seed script: inserts 8 template records into the database."""

import asyncio
import base64
import json
import os
import uuid

import asyncpg

DB_URL = (
    os.getenv("DATABASE_URL_SEED")
    or os.getenv("DATABASE_URL")
    or "postgresql://app:secret@postgres:5432/app_db"
)
# SQLAlchemy uses postgresql+asyncpg:// — asyncpg.connect() only accepts postgresql://
DB_URL = DB_URL.replace("postgresql+asyncpg://", "postgresql://")


def svg_data_uri(width: int, height: int, bg: str, label: str) -> str:
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">'
        f'<rect width="100%" height="100%" fill="{bg}"/>'
        f'<text x="50%" y="50%" fill="#ffffff" font-family="sans-serif" '
        f'font-size="{int(height / 8)}" text-anchor="middle" '
        f'dominant-baseline="middle">{label}</text>'
        f"</svg>"
    )
    return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"


TEMPLATES = [
    {
        "id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
        "name": "Drake Hotline",
        "category": "reaction",
        "image_path": svg_data_uri(600, 600, "#dc2626", "Drake Hotline"),
        "width": 600,
        "height": 600,
        "text_zones": [
            {
                "id": "t1",
                "x": 30,
                "y": 270,
                "font_family": "Impact",
                "font_size": 40,
                "color": "#000000",
                "width": 540,
                "height": 60,
            },
            {
                "id": "t2",
                "x": 30,
                "y": 530,
                "font_family": "Impact",
                "font_size": 40,
                "color": "#000000",
                "width": 540,
                "height": 60,
            },
        ],
    },
    {
        "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
        "name": "Distracted Boyfriend",
        "category": "classic",
        "image_path": svg_data_uri(800, 533, "#2563eb", "Distracted Boyfriend"),
        "width": 800,
        "height": 533,
        "text_zones": [
            {
                "id": "t1",
                "x": 50,
                "y": 40,
                "font_family": "Impact",
                "font_size": 36,
                "color": "#000000",
                "width": 250,
                "height": 50,
            },
            {
                "id": "t2",
                "x": 300,
                "y": 200,
                "font_family": "Impact",
                "font_size": 36,
                "color": "#000000",
                "width": 250,
                "height": 50,
            },
            {
                "id": "t3",
                "x": 500,
                "y": 250,
                "font_family": "Impact",
                "font_size": 36,
                "color": "#000000",
                "width": 250,
                "height": 50,
            },
        ],
    },
    {
        "id": uuid.UUID("33333333-3333-3333-3333-333333333333"),
        "name": "Two Buttons",
        "category": "decision",
        "image_path": svg_data_uri(680, 600, "#16a34a", "Two Buttons"),
        "width": 680,
        "height": 600,
        "text_zones": [
            {
                "id": "t1",
                "x": 80,
                "y": 160,
                "font_family": "Impact",
                "font_size": 34,
                "color": "#000000",
                "width": 230,
                "height": 50,
            },
            {
                "id": "t2",
                "x": 370,
                "y": 160,
                "font_family": "Impact",
                "font_size": 34,
                "color": "#000000",
                "width": 230,
                "height": 50,
            },
            {
                "id": "t3",
                "x": 200,
                "y": 520,
                "font_family": "Impact",
                "font_size": 34,
                "color": "#000000",
                "width": 280,
                "height": 50,
            },
        ],
    },
    {
        "id": uuid.UUID("44444444-4444-4444-4444-444444444444"),
        "name": "Change My Mind",
        "category": "opinion",
        "image_path": svg_data_uri(800, 600, "#7c3aed", "Change My Mind"),
        "width": 800,
        "height": 600,
        "text_zones": [
            {
                "id": "t1",
                "x": 150,
                "y": 100,
                "font_family": "Impact",
                "font_size": 32,
                "color": "#000000",
                "width": 500,
                "height": 50,
            },
        ],
    },
    {
        "id": uuid.UUID("55555555-5555-5555-5555-555555555555"),
        "name": "One Does Not Simply",
        "category": "classic",
        "image_path": svg_data_uri(960, 540, "#f59e0b", "One Does Not Simply"),
        "width": 960,
        "height": 540,
        "text_zones": [
            {
                "id": "t1",
                "x": 80,
                "y": 50,
                "font_family": "Impact",
                "font_size": 44,
                "color": "#ffffff",
                "width": 800,
                "height": 60,
            },
            {
                "id": "t2",
                "x": 80,
                "y": 460,
                "font_family": "Impact",
                "font_size": 44,
                "color": "#ffffff",
                "width": 800,
                "height": 60,
            },
        ],
    },
    {
        "id": uuid.UUID("66666666-6666-6666-6666-666666666666"),
        "name": "Batman Slap Robin",
        "category": "classic",
        "image_path": svg_data_uri(735, 570, "#0891b2", "Batman Slap Robin"),
        "width": 735,
        "height": 570,
        "text_zones": [
            {
                "id": "t1",
                "x": 30,
                "y": 50,
                "font_family": "Impact",
                "font_size": 36,
                "color": "#000000",
                "width": 320,
                "height": 50,
            },
            {
                "id": "t2",
                "x": 385,
                "y": 500,
                "font_family": "Impact",
                "font_size": 36,
                "color": "#000000",
                "width": 320,
                "height": 50,
            },
        ],
    },
    {
        "id": uuid.UUID("77777777-7777-7777-7777-777777777777"),
        "name": "Monkey Puppet",
        "category": "reaction",
        "image_path": svg_data_uri(500, 500, "#f97316", "Monkey Puppet"),
        "width": 500,
        "height": 500,
        "text_zones": [
            {
                "id": "t1",
                "x": 30,
                "y": 220,
                "font_family": "Impact",
                "font_size": 36,
                "color": "#000000",
                "width": 440,
                "height": 50,
            },
            {
                "id": "t2",
                "x": 30,
                "y": 420,
                "font_family": "Impact",
                "font_size": 36,
                "color": "#000000",
                "width": 440,
                "height": 50,
            },
        ],
    },
    {
        "id": uuid.UUID("88888888-8888-8888-8888-888888888888"),
        "name": "Expanding Brain",
        "category": "escalation",
        "image_path": svg_data_uri(600, 1200, "#6366f1", "Expanding Brain"),
        "width": 600,
        "height": 1200,
        "text_zones": [
            {
                "id": "t1",
                "x": 30,
                "y": 130,
                "font_family": "Impact",
                "font_size": 28,
                "color": "#000000",
                "width": 540,
                "height": 50,
            },
            {
                "id": "t2",
                "x": 30,
                "y": 430,
                "font_family": "Impact",
                "font_size": 28,
                "color": "#000000",
                "width": 540,
                "height": 50,
            },
            {
                "id": "t3",
                "x": 30,
                "y": 730,
                "font_family": "Impact",
                "font_size": 28,
                "color": "#000000",
                "width": 540,
                "height": 50,
            },
            {
                "id": "t4",
                "x": 30,
                "y": 1030,
                "font_family": "Impact",
                "font_size": 28,
                "color": "#000000",
                "width": 540,
                "height": 50,
            },
        ],
    },
]


async def seed() -> None:
    conn = await asyncpg.connect(DB_URL)
    try:
        # Clear existing
        await conn.execute("DELETE FROM render_history")
        await conn.execute("DELETE FROM templates")

        for t in TEMPLATES:
            await conn.execute(
                """
                INSERT INTO templates
                    (id, name, category, image_path, width, height, text_zones, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                """,
                t["id"],
                t["name"],
                t["category"],
                t["image_path"],
                t["width"],
                t["height"],
                json.dumps(t["text_zones"]),
            )

        print(f"Seeded {len(TEMPLATES)} templates")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
