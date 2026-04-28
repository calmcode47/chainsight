import pytest
import asyncio
import sys
import os
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator

# Ensure backend directory is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from middleware.auth import require_auth, require_demo_key


# Global Auth Bypass for Testing
async def bypass_auth():
    return {"sub": "test-user", "email": "test@example.com"}


async def bypass_demo_key():
    return True


app.dependency_overrides[require_auth] = bypass_auth
app.dependency_overrides[require_demo_key] = bypass_demo_key


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
