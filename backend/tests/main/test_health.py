import pytest
from fastapi import status
from httpx import ASGITransport, AsyncClient

from src.main import app


@pytest.mark.asyncio(loop_scope="function")
async def test_health_returns_ok():
    """The health endpoint responds without touching the database."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://localhost:8000"
    ) as client:
        response = await client.get("/health")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "ok"}
