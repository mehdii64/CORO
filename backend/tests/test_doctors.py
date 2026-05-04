def test_create_and_list_doctor(client):
    r = client.post("/api/doctors/", json={"name": "Dr Test", "active": True})
    assert r.status_code == 201
    assert r.json()["name"] == "Dr Test"

    r2 = client.get("/api/doctors/")
    assert len(r2.json()) == 1

def test_update_doctor(client):
    r = client.post("/api/doctors/", json={"name": "Dr A", "active": True})
    doc_id = r.json()["id"]
    r2 = client.put(f"/api/doctors/{doc_id}", json={"name": "Dr B", "active": False})
    assert r2.json()["name"] == "Dr B"
    assert r2.json()["active"] is False
