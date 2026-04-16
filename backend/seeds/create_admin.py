"""Seed script to create the first admin user.

Usage:
    cd backend && uv run python seeds/create_admin.py
    # or: cd backend && python -m seeds.create_admin

This creates an admin user with:
    email: admin@example.com
    password: admin123

Change these defaults after first login!
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from database import async_session_factory
from models import User
from services.auth_service import get_password_hash

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"


async def create_admin_user() -> None:
    """Create admin user if it doesn't exist."""
    async with async_session_factory() as session:
        # Check if admin already exists
        result = await session.execute(select(User).where(User.email == ADMIN_EMAIL))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"Admin user {ADMIN_EMAIL} already exists")
            return

        # Create admin user
        hashed_pw = get_password_hash(ADMIN_PASSWORD)
        admin = User(
            email=ADMIN_EMAIL,
            hashed_password=hashed_pw,
            role="admin",
            is_blocked=False,
        )
        session.add(admin)
        await session.commit()

        print("Admin user created successfully!")
        print(f"  Email: {ADMIN_EMAIL}")
        print(f"  Password: {ADMIN_PASSWORD}")
        print("\nIMPORTANT: Change the password after first login!")


if __name__ == "__main__":
    asyncio.run(create_admin_user())
