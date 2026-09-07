import hashlib
from datetime import datetime, timedelta

from app.models.refresh_token import RefreshToken


def test_refresh_tokens_store_hashes_and_support_rotation_metadata() -> None:
    raw_token = "opaque-refresh-token"
    token = RefreshToken(
        user_id=1,
        token_hash=hashlib.sha256(raw_token.encode()).hexdigest(),
        expires_at=datetime.utcnow() + timedelta(days=30),
    )

    assert token.token_hash != raw_token
    assert len(token.token_hash) == 64
    assert token.revoked_at is None
