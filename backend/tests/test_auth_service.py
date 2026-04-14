"""Tests for auth_service: token creation, decoding, password hashing."""

import uuid

import pytest

from services.auth_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_is_not_plain_password(self):
        hashed = get_password_hash("securepassword123")
        assert hashed != "securepassword123"
        assert hashed.startswith("$2")  # bcrypt prefix

    def test_verify_correct_password(self):
        password = "securepassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_wrong_password(self):
        hashed = get_password_hash("securepassword123")
        assert verify_password("wrongpassword", hashed) is False

    def test_different_hashes_for_same_password(self):
        """bcrypt includes a random salt, so hashes differ each time."""
        h1 = get_password_hash("samepassword")
        h2 = get_password_hash("samepassword")
        assert h1 != h2
        # But both verify correctly
        assert verify_password("samepassword", h1)
        assert verify_password("samepassword", h2)


class TestTokenCreation:
    def test_access_token_is_string(self):
        user_id = uuid.uuid4()
        token = create_access_token(user_id)
        assert isinstance(token, str)
        assert len(token) > 10

    def test_refresh_token_is_string(self):
        user_id = uuid.uuid4()
        token = create_refresh_token(user_id)
        assert isinstance(token, str)

    def test_access_token_contains_correct_sub(self):
        user_id = uuid.uuid4()
        token = create_access_token(user_id)
        payload = decode_token(token)
        assert payload["sub"] == str(user_id)
        assert payload["type"] == "access"

    def test_refresh_token_contains_correct_sub(self):
        user_id = uuid.uuid4()
        token = create_refresh_token(user_id)
        payload = decode_token(token)
        assert payload["sub"] == str(user_id)
        assert payload["type"] == "refresh"

    def test_access_token_has_exp(self):
        user_id = uuid.uuid4()
        token = create_access_token(user_id)
        payload = decode_token(token)
        assert "exp" in payload

    def test_decode_with_wrong_type_raises(self):
        user_id = uuid.uuid4()
        access = create_access_token(user_id)
        with pytest.raises(ValueError, match="Invalid token type"):
            decode_token(access, expected_type="refresh")
