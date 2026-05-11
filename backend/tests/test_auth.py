"""
認証 API テスト: /api/auth/register, /login, /me
"""
import pytest


class TestRegister:
    def test_register_success(self, client, test_user_data):
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["nickname"] == test_user_data["nickname"]
        assert "password_hash" not in data  # パスワードが返らないことを確認

    def test_register_duplicate_email(self, client, test_user_data, registered_user):
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_register_short_password(self, client):
        response = client.post("/api/auth/register", json={
            "email": "user@example.com",
            "password": "123",
            "nickname": "ユーザー",
        })
        assert response.status_code == 400

    def test_register_missing_nickname(self, client):
        response = client.post("/api/auth/register", json={
            "email": "user@example.com",
            "password": "ValidPassword1!",
            "nickname": "",
        })
        assert response.status_code == 400

    def test_register_invalid_email(self, client):
        response = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "password": "ValidPassword1!",
            "nickname": "ユーザー",
        })
        assert response.status_code == 422  # Pydantic validation error


class TestLogin:
    def test_login_success(self, client, test_user_data, registered_user):
        response = client.post(
            "/api/auth/login",
            data={
                "username": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    def test_login_wrong_password(self, client, test_user_data, registered_user):
        response = client.post(
            "/api/auth/login",
            data={
                "username": test_user_data["email"],
                "password": "WrongPassword!",
            },
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        response = client.post(
            "/api/auth/login",
            data={
                "username": "ghost@example.com",
                "password": "AnyPassword1!",
            },
        )
        assert response.status_code == 401


class TestGetMe:
    def test_get_me_authenticated(self, client, test_user_data, registered_user, auth_headers):
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["nickname"] == test_user_data["nickname"]

    def test_get_me_unauthenticated(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client):
        response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert response.status_code == 401
