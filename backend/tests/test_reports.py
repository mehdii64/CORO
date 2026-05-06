def test_create_and_get_report(client):
    r = client.post("/api/reports/", json={"type": "coro", "patient_name": "TEST", "exam_date": "2026-05-04"})
    assert r.status_code == 201
    rid = r.json()["id"]

    r2 = client.get(f"/api/reports/{rid}")
    assert r2.json()["report"]["patient_name"] == "TEST"
    assert r2.json()["clinical"] is not None
    assert r2.json()["technique"] is not None

def test_add_and_delete_lesion(client):
    rid = client.post("/api/reports/", json={"type": "coro"}).json()["id"]
    l = client.post(f"/api/reports/{rid}/lesions", json={
        "artery": "IVA_prox", "stenosis_pct": "70-90", "timi": 3,
        "good_distal_bed": True, "notes": "", "position": 0
    })
    assert l.status_code == 201
    lid = l.json()["id"]

    client.delete(f"/api/reports/{rid}/lesions/{lid}")
    r3 = client.get(f"/api/reports/{rid}")
    assert r3.json()["lesions"] == []

def test_delete_report(client):
    rid = client.post("/api/reports/", json={}).json()["id"]
    assert client.delete(f"/api/reports/{rid}").status_code == 204
    assert client.get(f"/api/reports/{rid}").status_code == 404
