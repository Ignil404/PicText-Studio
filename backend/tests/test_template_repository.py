"""Unit tests for TemplateRepository using mocked AsyncSession."""

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker

from models import Template
from repositories.template_repository import TemplateRepository


def _make_template(**overrides) -> Template:
    defaults = {
        "id": uuid.uuid4(),
        "name": "Test Template",
        "category": "reaction",
        "image_path": "/images/test.png",
        "width": 600,
        "height": 600,
        "text_zones": {},
    }
    t = Template(**{**defaults, **overrides})
    return t


@pytest.fixture
def session_factory() -> async_sessionmaker:
    factory = MagicMock(spec=async_sessionmaker)
    session = AsyncMock()
    factory.return_value.__aenter__ = AsyncMock(return_value=session)
    factory.return_value.__aexit__ = AsyncMock(return_value=None)
    factory._session = session
    return factory


@pytest.fixture
def repo(session_factory: async_sessionmaker) -> TemplateRepository:
    return TemplateRepository(session_factory)


@pytest.mark.asyncio
async def test_get_all_returns_templates_ordered(session_factory, repo):
    t1 = _make_template(name="A")
    t2 = _make_template(name="B")
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [t1, t2]
    session_factory._session.execute = AsyncMock(return_value=mock_result)

    result = await repo.get_all()

    assert len(result) == 2
    assert result[0].name == "A"
    assert result[1].name == "B"


@pytest.mark.asyncio
async def test_get_by_id_returns_template(session_factory, repo):
    tid = uuid.uuid4()
    t = _make_template(id=tid)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = t
    session_factory._session.execute = AsyncMock(return_value=mock_result)

    result = await repo.get_by_id(tid)

    assert result is not None
    assert result.id == tid


@pytest.mark.asyncio
async def test_get_by_id_returns_none_for_missing(session_factory, repo):
    tid = uuid.uuid4()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    session_factory._session.execute = AsyncMock(return_value=mock_result)

    result = await repo.get_by_id(tid)

    assert result is None


@pytest.mark.asyncio
async def test_get_categories_returns_distinct(session_factory, repo):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = ["classic", "reaction"]
    session_factory._session.execute = AsyncMock(return_value=mock_result)

    result = await repo.get_categories()

    assert result == ["classic", "reaction"]
