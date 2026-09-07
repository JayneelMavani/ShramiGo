from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hash_round_trip() -> None:
    password = "correct horse battery staple"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong password", hashed)


def test_access_token_contains_standard_claims() -> None:
    token = create_access_token({"sub": "42", "role": "admin"})
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["role"] == "admin"
    assert payload["iat"]
    assert payload["exp"]
    assert payload["jti"]
