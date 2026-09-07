import os
import threading
from datetime import date, time, timedelta
from decimal import Decimal

import pytest
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.service import Service
from app.models.user import User, UserRole
from app.models.worker_profile import WorkerProfile
from app.models.worker_service import WorkerService
from app.models.worker_availability import WorkerAvailability
from app.routers.bookings import create_booking
from app.schemas.booking import BookingCreate


@pytest.mark.postgres
def test_concurrent_booking_requests_allow_exactly_one_booking() -> None:
    database_url = os.getenv("TEST_DATABASE_URL", "")
    if not database_url.startswith("postgresql"):
        pytest.skip("PostgreSQL integration test skipped: TEST_DATABASE_URL is not configured.")

    database_name = make_url(database_url).database
    if database_name != "shramigo_test":
        pytest.fail("Refusing concurrency test: TEST_DATABASE_URL must target the isolated shramigo_test database")

    engine = create_engine(database_url, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine)
    seed = session_factory()
    suffix = threading.get_ident()
    worker = User(full_name="Concurrency Worker", phone=f"90000{suffix % 100000}", email=f"worker-{suffix}@test.invalid", password_hash="x", role=UserRole.WORKER, is_verified=True)
    customer_one = User(full_name="Customer One", phone=f"91000{suffix % 100000}", email=f"customer-one-{suffix}@test.invalid", password_hash="x", role=UserRole.CUSTOMER)
    customer_two = User(full_name="Customer Two", phone=f"92000{suffix % 100000}", email=f"customer-two-{suffix}@test.invalid", password_hash="x", role=UserRole.CUSTOMER)
    service = Service(name="Concurrency Service", category="test", base_price=Decimal("100.00"), is_active=True)
    seed.add_all([worker, customer_one, customer_two, service])
    seed.flush()
    seed.add(WorkerProfile(user_id=worker.id))
    seed.add(WorkerService(worker_id=worker.id, service_id=service.id, is_active=True))
    monday = date.today() + timedelta(days=(7 - date.today().weekday()) % 7 or 7)
    seed.add(WorkerAvailability(worker_id=worker.id, day_of_week="monday", start_time=time(10), end_time=time(12), is_available=True))
    seed.commit()
    customer_ids = [customer_one.id, customer_two.id]
    worker_id = worker.id
    service_id = service.id
    seed.close()

    barrier = threading.Barrier(2)
    outcomes: list[str] = []

    def attempt(customer_id: int) -> None:
        session = session_factory()
        try:
            customer = session.get(User, customer_id)
            barrier.wait()
            try:
                create_booking(
                    BookingCreate(worker_id=worker_id, service_id=service_id, booking_date=monday, booking_time=time(10), hours=2, service_address="A valid service address", payment_method="cash"),
                    session,
                    customer,
                )
                outcomes.append("success")
            except Exception as exc:
                session.rollback()
                outcomes.append(type(exc).__name__)
        finally:
            session.close()

    threads = [threading.Thread(target=attempt, args=(customer_id,)) for customer_id in customer_ids]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
    assert outcomes.count("success") == 1
