import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


def test_cors_simple_get_from_lan_origin(client):
    response = client.get("/", headers={"Origin": "http://192.168.1.150:5173"})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://192.168.1.150:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_preflight_options_with_headers(client):
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://192.168.1.150:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://192.168.1.150:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"
    assert "POST" in response.headers.get("access-control-allow-methods", "")


def test_cors_private_network_access_preflight(client):
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://192.168.1.150:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
            "Access-Control-Request-Private-Network": "true",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://192.168.1.150:5173"
    assert response.headers.get("access-control-allow-private-network") == "true"


def test_cors_headers_preserved_on_uncaught_error(client):
    # Dynamically mount a temporary error endpoint to verify global exception handler CORS headers
    @app.get("/api/test-cors-error-trigger")
    def trigger_error():
        raise RuntimeError("Testing CORS on 500 error")

    response = client.get(
        "/api/test-cors-error-trigger",
        headers={"Origin": "http://192.168.1.150:5173"},
    )
    assert response.status_code == 500
    assert response.headers.get("access-control-allow-origin") == "http://192.168.1.150:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"
