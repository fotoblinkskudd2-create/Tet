from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_create_and_list_sample():
    payload = {
        "lat": 60.752,
        "lng": 4.575,
        "mercury_ppm": 0.47,
        "source": "official",
    }
    r = client.post("/samples", json=payload)
    assert r.status_code == 201
    assert r.json()["mercury_ppm"] == 0.47

    r = client.get("/samples")
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_create_report():
    payload = {
        "lat": 60.75,
        "lng": 4.58,
        "type": "dead_fish",
        "description": "Found three dead cod near the rocks, unusual smell.",
    }
    r = client.post("/reports", json=payload)
    assert r.status_code == 201
    assert r.json()["status"] == "pending"


def test_mercury_stats():
    r = client.get("/stats/mercury")
    assert r.status_code == 200
    assert "current_ppm" in r.json()
