"""Unit tests for RenderService.render_image using temp directory and test images."""

import uuid
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest
from PIL import Image

from models import Template
from repositories.render_history_repository import RenderHistoryRepository
from repositories.template_repository import TemplateRepository
from schemas import RenderRequest
from services.render_service import RenderError, RenderService


@pytest.fixture
def template_image(tmp_path: Path) -> Path:
    """Create a minimal test template image."""
    img_path = tmp_path / "test_template.png"
    img = Image.new("RGBA", (600, 600), (255, 0, 0, 255))
    img.save(str(img_path))
    return img_path


@pytest.fixture
def output_dir(tmp_path: Path) -> Path:
    d = tmp_path / "rendered"
    d.mkdir()
    return d


@pytest.fixture
def font_dir(tmp_path: Path) -> Path:
    """Create a font directory with a minimal test font."""
    d = tmp_path / "fonts"
    d.mkdir()
    # Create a minimal valid font file — we'll use default Pillow font instead
    # since creating real .ttf files is complex. We'll mock the font loading.
    return d


@pytest.fixture
def mock_template(template_image: Path) -> Template:
    tid = uuid.uuid4()
    return Template(
        id=tid,
        name="Test Template",
        category="test",
        image_path=str(template_image),
        width=600,
        height=600,
        text_zones={},
    )


@pytest.fixture
def mock_repo(mock_template: Template) -> TemplateRepository:
    repo = MagicMock(spec=TemplateRepository)
    repo.get_by_id = AsyncMock(return_value=mock_template)
    return repo


@pytest.fixture
def mock_history_repo() -> RenderHistoryRepository:
    repo = MagicMock(spec=RenderHistoryRepository)
    mock_record = MagicMock()
    mock_record.id = uuid.uuid4()
    repo.create = AsyncMock(return_value=mock_record)
    return repo


@pytest.fixture
def render_service(
    mock_repo: TemplateRepository,
    mock_history_repo: RenderHistoryRepository,
    font_dir: Path,
    output_dir: Path,
) -> RenderService:
    return RenderService(
        template_repo=mock_repo,
        history_repo=mock_history_repo,
        font_dir=str(font_dir),
        output_dir=str(output_dir),
    )


@pytest.mark.asyncio
async def test_render_image_creates_file(render_service, mock_repo, mock_history_repo, tmp_path):
    tid = uuid.uuid4()
    # Override mock to use this specific ID
    mock_template = MagicMock(spec=Template)
    mock_template.image_path = str(tmp_path / "test_template.png")
    img = Image.new("RGBA", (600, 600), (0, 255, 0, 255))
    img.save(mock_template.image_path)
    mock_repo.get_by_id = AsyncMock(return_value=mock_template)

    request = RenderRequest(
        session_id="test-session",
        template_id=tid,
        text_blocks=[],
        format="png",
    )

    result = await render_service.render_image(request)

    assert result.image_url.startswith("/api/rendered/")
    assert result.image_url.endswith(".png")
    mock_history_repo.create.assert_awaited_once()


@pytest.mark.asyncio
async def test_render_image_raises_for_missing_template(
    mock_repo, mock_history_repo, font_dir, output_dir
):
    mock_repo.get_by_id = AsyncMock(return_value=None)
    service = RenderService(
        template_repo=mock_repo,
        history_repo=mock_history_repo,
        font_dir=str(font_dir),
        output_dir=str(output_dir),
    )

    with pytest.raises(RenderError, match="Template not found"):
        await service.render_image(
            RenderRequest(
                session_id="session",
                template_id=uuid.uuid4(),
                text_blocks=[],
                format="png",
            )
        )


@pytest.mark.asyncio
async def test_render_image_jpeg_format(render_service, mock_repo, mock_history_repo, tmp_path):
    tid = uuid.uuid4()
    mock_template = MagicMock(spec=Template)
    mock_template.image_path = str(tmp_path / "test_template.png")
    img = Image.new("RGBA", (600, 600), (0, 0, 255, 255))
    img.save(mock_template.image_path)
    mock_repo.get_by_id = AsyncMock(return_value=mock_template)

    request = RenderRequest(
        session_id="test-session",
        template_id=tid,
        text_blocks=[],
        format="jpeg",
    )

    result = await render_service.render_image(request)

    assert result.image_url.endswith(".jpeg")


@pytest.mark.asyncio
async def test_render_image_records_history(render_service, mock_repo, mock_history_repo, tmp_path):
    tid = uuid.uuid4()
    mock_template = MagicMock(spec=Template)
    mock_template.image_path = str(tmp_path / "test_template.png")
    img = Image.new("RGBA", (600, 600), (128, 128, 128, 255))
    img.save(mock_template.image_path)
    mock_repo.get_by_id = AsyncMock(return_value=mock_template)

    request = RenderRequest(
        session_id="session-123",
        template_id=tid,
        text_blocks=[],
        format="png",
    )

    await render_service.render_image(request)

    call_args = mock_history_repo.create.await_args
    assert call_args.kwargs["session_id"] == "session-123"
    assert call_args.kwargs["template_id"] == tid


# --- Coordinate conversion and anchor mapping tests ---


def test_percent_to_pixel():
    assert RenderService._percent_to_pixel(50, 600) == 300.0
    assert RenderService._percent_to_pixel(30, 600) == 180.0
    assert RenderService._percent_to_pixel(0, 800) == 0.0
    assert RenderService._percent_to_pixel(100, 800) == 800.0
    assert RenderService._percent_to_pixel(25.5, 400) == 102.0


def test_text_align_to_anchor():
    assert RenderService._text_align_to_anchor("left") == "lm"
    assert RenderService._text_align_to_anchor("center") == "mm"
    assert RenderService._text_align_to_anchor("right") == "rm"
    assert RenderService._text_align_to_anchor(None) == "lm"
    assert RenderService._text_align_to_anchor("invalid") == "lm"
