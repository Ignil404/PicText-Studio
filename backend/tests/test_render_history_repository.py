"""Unit tests for RenderHistoryRepository using mocked AsyncSession."""

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker

from models import RenderHistory
from repositories.render_history_repository import RenderHistoryRepository


@pytest.fixture
def session_factory() -> async_sessionmaker:
    factory = MagicMock(spec=async_sessionmaker)
    session = AsyncMock()
    session.add = MagicMock()  # sync method, not async
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    factory.return_value.__aenter__ = AsyncMock(return_value=session)
    factory.return_value.__aexit__ = AsyncMock(return_value=None)
    factory._session = session
    return factory


@pytest.fixture
def repo(session_factory: async_sessionmaker) -> RenderHistoryRepository:
    return RenderHistoryRepository(session_factory)


@pytest.mark.asyncio
async def test_create_returns_record(session_factory, repo):
    tid = uuid.uuid4()
    session = session_factory._session

    async def mock_refresh(record):
        record.id = uuid.uuid4()

    session.refresh = mock_refresh

    await repo.create(
        session_id="test-session-1",
        template_id=tid,
        text_blocks={"text": "hello"},
        image_path="/rendered/test.png",
    )

    session.add.assert_called_once()
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_by_session_returns_records(session_factory, repo):
    session = session_factory._session
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [MagicMock(spec=RenderHistory)]
    session.execute = AsyncMock(return_value=mock_result)

    result = await repo.get_by_session("test-session-1")

    assert len(result) == 1


@pytest.mark.asyncio
async def test_get_by_session_returns_empty_for_unknown(session_factory, repo):
    session = session_factory._session
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    session.execute = AsyncMock(return_value=mock_result)

    result = await repo.get_by_session("unknown-session")

    assert result == []
