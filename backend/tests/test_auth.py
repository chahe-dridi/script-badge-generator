"""Auth flow: register, duplicate guard, login, /me, bad credentials, refresh."""


def test_register_returns_free_plan(client):
    r = client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "password": "supersecret", "full_name": "Alice"},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "alice@example.com"
    assert body["plan"] == "free"
    assert "hashed_password" not in body  # never leak the hash


def test_duplicate_email_rejected(client):
    client.post("/api/auth/register", json={"email": "dup@example.com", "password": "supersecret"})
    r = client.post("/api/auth/register", json={"email": "dup@example.com", "password": "supersecret"})
    assert r.status_code == 409


def test_short_password_rejected(client):
    r = client.post("/api/auth/register", json={"email": "short@example.com", "password": "123"})
    assert r.status_code == 422  # pydantic min_length


def test_login_and_me(client):
    client.post("/api/auth/register", json={"email": "bob@example.com", "password": "supersecret"})

    r = client.post("/api/auth/login", data={"username": "bob@example.com", "password": "supersecret"})
    assert r.status_code == 200
    tokens = r.json()
    assert tokens["token_type"] == "bearer"

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert me.status_code == 200
    assert me.json()["email"] == "bob@example.com"


def test_wrong_password_401(client):
    client.post("/api/auth/register", json={"email": "carol@example.com", "password": "supersecret"})
    r = client.post("/api/auth/login", data={"username": "carol@example.com", "password": "nope"})
    assert r.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_refresh_token_cannot_be_used_as_access(client):
    client.post("/api/auth/register", json={"email": "dave@example.com", "password": "supersecret"})
    tokens = client.post(
        "/api/auth/login", data={"username": "dave@example.com", "password": "supersecret"}
    ).json()

    # Using the refresh token as a bearer access token must fail (type mismatch).
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tokens['refresh_token']}"})
    assert r.status_code == 401

    # But it works at the refresh endpoint.
    r2 = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert r2.status_code == 200
    assert "access_token" in r2.json()
