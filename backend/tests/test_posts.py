"""
投稿 API テスト: /api/posts
"""
import pytest


SAMPLE_POST = {
    "title": "テスト投稿タイトル",
    "content": "これはテスト投稿の内容です。",
    "source_language": "ja",
    "category": "life",
    "tags": ["テスト", "勉強"],
    "is_anonymous": False,
}


class TestGetPosts:
    def test_get_posts_empty(self, client):
        response = client.get("/api/posts/")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_posts_after_create(self, client, auth_headers):
        client.post("/api/posts/", json=SAMPLE_POST, headers=auth_headers)
        response = client.get("/api/posts/")
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_get_posts_pagination(self, client, auth_headers):
        for i in range(5):
            p = SAMPLE_POST.copy()
            p["title"] = f"投稿 {i}"
            client.post("/api/posts/", json=p, headers=auth_headers)

        response = client.get("/api/posts/?limit=3")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_posts_filter_category(self, client, auth_headers):
        post_life = SAMPLE_POST.copy()
        post_life["category"] = "life"
        post_job = SAMPLE_POST.copy()
        post_job["title"] = "就活投稿"
        post_job["category"] = "job"

        client.post("/api/posts/", json=post_life, headers=auth_headers)
        client.post("/api/posts/", json=post_job, headers=auth_headers)

        response = client.get("/api/posts/?category=job")
        assert response.status_code == 200
        posts = response.json()
        assert all(p["category"] == "job" for p in posts)


class TestCreatePost:
    def test_create_post_success(self, client, auth_headers):
        response = client.post("/api/posts/", json=SAMPLE_POST, headers=auth_headers)
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["title"] == SAMPLE_POST["title"]
        assert data["content"] == SAMPLE_POST["content"]

    def test_create_post_anonymous(self, client, auth_headers):
        anon_post = SAMPLE_POST.copy()
        anon_post["is_anonymous"] = True
        response = client.post("/api/posts/", json=anon_post, headers=auth_headers)
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["is_anonymous"] is True
        assert data.get("author") is None  # 匿名の場合は著者情報なし

    def test_create_post_unauthenticated(self, client):
        response = client.post("/api/posts/", json=SAMPLE_POST)
        assert response.status_code == 401

    def test_create_post_title_too_long(self, client, auth_headers):
        long_post = SAMPLE_POST.copy()
        long_post["title"] = "あ" * 301  # 300文字制限超過
        response = client.post("/api/posts/", json=long_post, headers=auth_headers)
        assert response.status_code == 422


class TestDeletePost:
    def test_delete_own_post(self, client, auth_headers):
        create_resp = client.post("/api/posts/", json=SAMPLE_POST, headers=auth_headers)
        post_id = create_resp.json()["id"]

        delete_resp = client.delete(f"/api/posts/{post_id}", headers=auth_headers)
        assert delete_resp.status_code in (200, 204)

        get_resp = client.get(f"/api/posts/{post_id}")
        assert get_resp.status_code == 404

    def test_delete_others_post(self, client, auth_headers, db_session):
        """他ユーザーの投稿は削除できない"""
        # 別ユーザーを作成してログイン
        client.post("/api/auth/register", json={
            "email": "other@example.com",
            "password": "OtherPass123!",
            "nickname": "別ユーザー",
        })
        other_login = client.post("/api/auth/login", data={
            "username": "other@example.com",
            "password": "OtherPass123!",
        })
        other_token = other_login.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}

        # 最初のユーザーが投稿を作成
        create_resp = client.post("/api/posts/", json=SAMPLE_POST, headers=auth_headers)
        post_id = create_resp.json()["id"]

        # 別ユーザーが削除を試みる
        delete_resp = client.delete(f"/api/posts/{post_id}", headers=other_headers)
        assert delete_resp.status_code == 403
