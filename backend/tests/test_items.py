"""
フリマ API テスト: /api/items
"""
import pytest


SAMPLE_ITEM = {
    "title": "計算機科学の教科書",
    "description": "3年生で使った教科書。ほぼ新品。",
    "price": 1500,
    "category": "books",
    "condition": "good",
    "is_anonymous": False,
}


class TestGetItems:
    def test_get_items_empty(self, client):
        response = client.get("/api/items/")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_items_after_create(self, client, auth_headers):
        client.post("/api/items/", json=SAMPLE_ITEM, headers=auth_headers)
        response = client.get("/api/items/")
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_get_items_filter_category(self, client, auth_headers):
        books_item = SAMPLE_ITEM.copy()
        books_item["category"] = "books"
        electronics_item = SAMPLE_ITEM.copy()
        electronics_item["title"] = "古いラップトップ"
        electronics_item["category"] = "electronics"

        client.post("/api/items/", json=books_item, headers=auth_headers)
        client.post("/api/items/", json=electronics_item, headers=auth_headers)

        response = client.get("/api/items/?category=books")
        assert response.status_code == 200
        items = response.json()
        assert all(i["category"] == "books" for i in items)


class TestCreateItem:
    def test_create_item_success(self, client, auth_headers):
        response = client.post("/api/items/", json=SAMPLE_ITEM, headers=auth_headers)
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["title"] == SAMPLE_ITEM["title"]
        assert data["price"] == SAMPLE_ITEM["price"]

    def test_create_item_unauthenticated(self, client):
        response = client.post("/api/items/", json=SAMPLE_ITEM)
        assert response.status_code == 401

    def test_create_item_negative_price(self, client, auth_headers):
        negative_price = SAMPLE_ITEM.copy()
        negative_price["price"] = -100
        response = client.post("/api/items/", json=negative_price, headers=auth_headers)
        # マイナス価格は拒否されるべき
        assert response.status_code in (400, 422)


class TestItemDetail:
    def test_get_item_by_id(self, client, auth_headers):
        create_resp = client.post("/api/items/", json=SAMPLE_ITEM, headers=auth_headers)
        item_id = create_resp.json()["id"]

        response = client.get(f"/api/items/{item_id}")
        assert response.status_code == 200
        assert response.json()["id"] == item_id

    def test_get_nonexistent_item(self, client):
        response = client.get("/api/items/99999")
        assert response.status_code == 404
