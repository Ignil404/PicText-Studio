"""User profile image router."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from dependencies import get_current_user
from models import User

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

UPLOAD_DIR = Path(__file__).parent.parent / "uploads" / "profile-images"

router = APIRouter(prefix="/api", tags=["profile-image"])


def _get_image_path(user_id: uuid.UUID, extension: str) -> Path:
    """Generate file path for user's profile image."""
    return UPLOAD_DIR / f"{user_id.hex}{extension}"


def _get_user_image_path(user_id: uuid.UUID) -> Path | None:
    """Find existing profile image for user."""
    for ext in ALLOWED_EXTENSIONS:
        path = _get_image_path(user_id, ext)
        if path.exists():
            return path
    return None


@router.post("/users/me/image", response_model=dict[str, str])
async def upload_profile_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Upload or update user's profile image."""
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5MB.",
        )

    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: JPEG, PNG, GIF, WebP",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5MB.",
        )

    existing = _get_user_image_path(user.id)
    if existing:
        existing.unlink()

    file_path = _get_image_path(user.id, extension)
    file_path.write_bytes(content)

    return {"image_url": f"/api/uploads/{user.id.hex}{extension}"}


@router.get("/users/me/image")
async def get_profile_image(
    user: User = Depends(get_current_user),
) -> FileResponse:
    """Get user's profile image."""
    image_path = _get_user_image_path(user.id)
    if image_path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile image found",
        )
    return FileResponse(image_path)


@router.delete("/users/me/image", response_model=dict[str, str])
async def delete_profile_image(
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Delete user's profile image."""
    image_path = _get_user_image_path(user.id)
    if image_path:
        image_path.unlink()
    return {"message": "Profile image deleted"}
