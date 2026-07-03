"""Plan catalog + server-side quota gating on projects."""


def _auth_headers(client, email):
    client.post("/api/auth/register", json={"email": email, "password": "supersecret"})
    tokens = client.post(
        "/api/auth/login", data={"username": email, "password": "supersecret"}
    ).json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}


def test_plan_catalog_lists_all_tiers(client):
    r = client.get("/api/plans")
    assert r.status_code == 200
    tiers = {p["tier"] for p in r.json()}
    assert {"free", "pro", "team"} <= tiers


def test_free_plan_project_quota_enforced(client):
    h = _auth_headers(client, "quota@example.com")

    # Free plan allows 3 projects.
    for i in range(3):
        r = client.post("/api/projects", json={"name": f"Project {i}", "config": {}}, headers=h)
        assert r.status_code == 201, r.text

    # The 4th must be rejected by the server, not the client.
    r = client.post("/api/projects", json={"name": "Project 4", "config": {}}, headers=h)
    assert r.status_code == 403
    assert "limit" in r.json()["detail"].lower()


def test_my_plan_reports_usage(client):
    h = _auth_headers(client, "usage@example.com")
    client.post("/api/projects", json={"name": "One", "config": {"font_size": 40}}, headers=h)

    r = client.get("/api/plans/me", headers=h)
    assert r.status_code == 200
    body = r.json()
    assert body["tier"] == "free"
    assert body["usage"]["projects"] == 1
    assert body["limits"]["max_projects"] == 3


def test_projects_are_owner_scoped(client):
    h1 = _auth_headers(client, "owner1@example.com")
    h2 = _auth_headers(client, "owner2@example.com")

    created = client.post("/api/projects", json={"name": "Secret", "config": {}}, headers=h1).json()
    pid = created["id"]

    # Other user cannot see or delete it — 404 (not 403), don't confirm existence.
    assert client.delete(f"/api/projects/{pid}", headers=h2).status_code == 404
    listing = client.get("/api/projects", headers=h2).json()
    assert all(p["id"] != pid for p in listing)
