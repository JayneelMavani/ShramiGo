import hashlib
from typing import Any

import redis

from app.core.config import settings


class LoginRateLimiter:
    def __init__(self) -> None:
        self.client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True) if settings.REDIS_URL else None

    def check(self, ip_address: str, email: str) -> bool:
        if self.client is None:
            return True
        try:
            keys = [
                f"login:ip:{ip_address}",
                f"login:email:{hashlib.sha256(email.lower().encode()).hexdigest()}",
            ]
            counts: list[int] = []
            pipe = self.client.pipeline()
            for key in keys:
                pipe.incr(key)
                pipe.expire(key, settings.LOGIN_RATE_LIMIT_WINDOW_SECONDS)
            result: list[Any] = pipe.execute()
            counts = [int(result[index]) for index in range(0, len(result), 2)]
            return counts[0] <= settings.LOGIN_RATE_LIMIT_IP and counts[1] <= settings.LOGIN_RATE_LIMIT_EMAIL
        except redis.RedisError:
            return True


login_rate_limiter = LoginRateLimiter()