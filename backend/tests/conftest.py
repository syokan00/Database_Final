"""
テスト設定とフィクスチャ

SQLite インメモリDBを使用してテスト環境を完全に分離します。
本番DBには一切接続しません。
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# テスト用に JWT_SECRET を事前設定
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests")
os.environ.setdefault("JWT_ALGORITHM", "HS256")

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """各テスト関数にクリーンなDBセッションを提供"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """テスト用 FastAPI クライアント（DBセッションをオーバーライド）"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    return {
        "email": "testuser@example.com",
        "password": "TestPassword123!",
        "nickname": "テストユーザー",
    }


@pytest.fixture
def registered_user(client, test_user_data):
    """登録済みテストユーザーを返す"""
    response = client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def auth_headers(client, test_user_data, registered_user):
    """認証済みリクエストヘッダーを返す"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user_data["email"],
            "password": test_user_data["password"],
        },
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
