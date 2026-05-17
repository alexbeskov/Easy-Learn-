from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert "polza_configured" in payload


def test_generate_course_requires_urls():
    response = client.post("/api/course/generate", json={"topic": "AI", "urls": []})
    assert response.status_code == 422
