import pytest
from fastapi import status


@pytest.fixture
async def authed_client(test_client, authenticated_user):
    """Test client with the auth cookie set via the login endpoint."""
    creds = authenticated_user["user_data"]
    response = await test_client.post(
        "/auth/jwt/login",
        data={"username": creds["email"], "password": creds["password"]},
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    return test_client


class TestItems:
    @pytest.mark.asyncio(loop_scope="function")
    async def test_requires_auth(self, test_client):
        response = await test_client.get("/items")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio(loop_scope="function")
    async def test_create_and_list(self, authed_client):
        create = await authed_client.post(
            "/items",
            json={"name": "Widget", "description": "A thing", "quantity": 3},
        )
        assert create.status_code == status.HTTP_201_CREATED
        body = create.json()
        assert body["name"] == "Widget"
        assert body["quantity"] == 3

        listing = await authed_client.get("/items")
        assert listing.status_code == status.HTTP_200_OK
        items = listing.json()
        assert len(items) == 1
        assert items[0]["id"] == body["id"]

    @pytest.mark.asyncio(loop_scope="function")
    async def test_delete(self, authed_client):
        create = await authed_client.post("/items", json={"name": "Disposable"})
        item_id = create.json()["id"]

        delete = await authed_client.delete(f"/items/{item_id}")
        assert delete.status_code == status.HTTP_204_NO_CONTENT

        listing = await authed_client.get("/items")
        assert listing.json() == []
