"""Tests for UserRepository: create, get_by_email, count_renders."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from models import User
from repositories.user_repository import UserRepository


@pytest.fixture
def session_and_repo() -> tuple[MagicMock, UserRepository]:
    session = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.execute = AsyncMock()

    session_context = MagicMock()
    session_context.__aenter__ = AsyncMock(return_value=session)
    session_context.__aexit__ = AsyncMock(return_value=None)

    session_factory = MagicMock(return_value=session_context)
    repo = UserRepository(session_factory)
    return session, repo


class TestUserRepository:
    @pytest.mark.asyncio
    async def test_create(self, session_and_repo: tuple[MagicMock, UserRepository]) -> None:
        session, repo = session_and_repo

        user = await repo.create(email="test@example.com", hashed_password="hashed_pw")

        assert isinstance(user, User)
        assert user.email == "test@example.com"
        assert user.hashed_password == "hashed_pw"
        session.add.assert_called_once_with(user)
        session.commit.assert_awaited_once()
        session.refresh.assert_awaited_once_with(user)

    @pytest.mark.asyncio
    async def test_get_by_email_found(
        self,
        session_and_repo: tuple[MagicMock, UserRepository],
    ) -> None:
        session, repo = session_and_repo
        expected_user = User(
            id=uuid.uuid4(),
            email="findme@example.com",
            hashed_password="hashed_pw",
        )

        result = MagicMock()
        result.scalar_one_or_none.return_value = expected_user
        session.execute.return_value = result

        user = await repo.get_by_email("findme@example.com")

        assert user == expected_user
        session.execute.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_get_by_email_not_found(
        self,
        session_and_repo: tuple[MagicMock, UserRepository],
    ) -> None:
        session, repo = session_and_repo

        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        session.execute.return_value = result

        user = await repo.get_by_email("nonexistent@example.com")

        assert user is None
        session.execute.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_count_renders(
        self,
        session_and_repo: tuple[MagicMock, UserRepository],
    ) -> None:
        session, repo = session_and_repo

        result = MagicMock()
        result.scalar_one.return_value = 2
        session.execute.return_value = result

        count = await repo.count_renders_by_user(uuid.uuid4())

        assert count == 2
        session.execute.assert_awaited_once()
