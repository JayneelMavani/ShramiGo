from app.services.rate_limit import LoginRateLimiter


class FakePipeline:
    def __init__(self) -> None:
        self.commands: list[tuple[str, str, int | None]] = []

    def incr(self, key: str):
        self.commands.append(("incr", key, None))
        return self

    def expire(self, key: str, seconds: int):
        self.commands.append(("expire", key, seconds))
        return self

    def execute(self):
        return [1, True, 1, True]


class FakeRedis:
    def __init__(self) -> None:
        self.fake_pipeline = FakePipeline()

    def pipeline(self):
        return self.fake_pipeline


def test_rate_limiter_uses_shared_atomic_pipeline() -> None:
    limiter = LoginRateLimiter()
    limiter.client = FakeRedis()

    assert limiter.check("127.0.0.1", "USER@example.com")
    commands = limiter.client.fake_pipeline.commands
    assert [command[0] for command in commands] == ["incr", "expire", "incr", "expire"]
    assert "email:" in commands[2][1]
