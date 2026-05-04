def test_export_returns_docx(client):
    rid = client.post("/api/reports/", json={
        "patient_name": "TEST PATIENT",
        "exam_date": "2026-05-04",
        "ipp": "9999"
    }).json()["id"]

    r = client.get(f"/api/export/{rid}")
    assert r.status_code == 200
    assert "wordprocessingml" in r.headers["content-type"]
    assert len(r.content) > 1000

def test_export_404(client):
    r = client.get("/api/export/99999")
    assert r.status_code == 404
