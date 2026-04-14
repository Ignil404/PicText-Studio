"""Tests for auth router: registration, login, refresh, logout, /me, migration."""


import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def valid_user_data():
    return {"email": "test@example.com", "password": "securepass123"}


class TestRegister:
    def test_register_success(self, client: TestClient, valid_user_data):
        resp = client.post("/api/auth/register", json=valid_user_data)
        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert data["email"] == valid_user_data["email"]
        assert "id" in data
        assert "created_at" in data
        # Check refresh cookie set
        assert "refresh_token" in resp.cookies

    def test_register_duplicate_email(self, client: TestClient, valid_user_data):
        client.post("/api/auth/register", json=valid_user_data)
        resp = client.post("/api/auth/register", json=valid_user_data)
        assert resp.status_code == 409

    def test_register_short_password(self, client: TestClient):
        resp = client.post("/api/auth/register", json={"email": "a@b.com", "password": "short"})
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client: TestClient, valid_user_data):
        client.post("/api/auth/register", json=valid_user_data)
        resp = client.post("/api/auth/login", json=valid_user_data)
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "refresh_token" in resp.cookies

    def test_login_wrong_password(self, client: TestClient, valid_user_data):
        client.post("/api/auth/register", json=valid_user_data)
        resp = client.post(
            "/api/auth/login",
            json={"email": valid_user_data["email"], "password": "wrongpassword"},
        )
        assert resp.status_code == 401

    def test_login_unknown_email(self, client: TestClient):
        resp = client.post(
            "/api/auth/login",
            json={"email": "nope@example.com", "password": "pass"},
        )
        assert resp.status_code == 401


class TestRefresh:
    def test_refresh_success(self, client: TestClient, valid_user_data):
        # Register and capture refresh token
        resp = client.post("/api/auth/register", json=valid_user_data)
        refresh_token = resp.cookies.get("refresh_token")

        resp = client.post("/api/auth/refresh", cookies={"refresh_token": refresh_token})
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data

    def test_refresh_no_token(self, client: TestClient):
        resp = client.post("/api/auth/refresh")
        assert resp.status_code == 401


class TestLogout:
    def test_logout(self, client: TestClient, valid_user_data):
        client.post("/api/auth/register", json=valid_user_data)
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 204


class TestGetMe:
    def test_get_me_authenticated(self, client: TestClient, valid_user_data):
        # Register and login
        client.post("/api/auth/register", json=valid_user_data)
        login_resp = client.post("/api/auth/login", json=valid_user_data)
        access_token = login_resp.json()["access_token"]

        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == valid_user_data["email"]

    def test_get_me_no_auth(self, client: TestClient):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401


class TestMigrateSession:
    def test_migrate_session(self, client: TestClient, valid_user_data):
        # Register + login
        client.post("/api/auth/register", json=valid_user_data)
        login_resp = client.post("/api/auth/login", json=valid_user_data)
        access_token = login_resp.json()["access_token"]

        resp = client.post(
            "/api/auth/migrate-session",
            json={"session_id": "guest-session-123"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "migrated_count" in data
