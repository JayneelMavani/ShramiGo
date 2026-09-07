import logging
from datetime import time
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.service import Service
from app.models.customer_profile import CustomerProfile
from app.models.worker_profile import WorkerProfile
from app.models.worker_service import WorkerService
from app.models.worker_availability import WorkerAvailability
from app.seed_services import SERVICES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_all():
    logger.info("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Services
        logger.info("Seeding Services...")
        service_map = {}
        for s_data in SERVICES:
            existing = db.query(Service).filter(Service.name == s_data["name"]).first()
            if not existing:
                existing = Service(**s_data)
                db.add(existing)
                db.flush()
            service_map[existing.name] = existing

        # 2. Seed Admin User
        logger.info("Seeding Admin User...")
        admin = db.query(User).filter(User.email == "admin@shramigo.com").first()
        if not admin:
            admin = User(
                full_name="Admin User",
                email="admin@shramigo.com",
                phone="9999999999",
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)

        # 3. Seed Worker User
        logger.info("Seeding Worker User...")
        worker = db.query(User).filter(User.email == "worker@shramigo.com").first()
        if not worker:
            worker = User(
                full_name="Ramesh Kumar (Electrician & Plumber)",
                email="worker@shramigo.com",
                phone="8888888888",
                password_hash=hash_password("worker123"),
                role=UserRole.WORKER,
                is_active=True,
                is_verified=True,
            )
            db.add(worker)
            db.flush()

            # Worker Profile
            w_profile = WorkerProfile(
                user_id=worker.id,
                address="123 Main Street",
                city="Mumbai",
                state="Maharashtra",
                pincode="400001",
                bio="Experienced electrician and plumber with 5+ years of quality service.",
                experience_years=5,
                latitude=19.0760,
                longitude=72.8777,
                service_radius_km=15.0,
            )
            db.add(w_profile)

            # Link Worker Services
            for s_name in ["Electrical Repair", "Plumbing Repair", "AC Repair"]:
                if s_name in service_map:
                    ws = WorkerService(
                        worker_id=worker.id,
                        service_id=service_map[s_name].id,
                        is_active=True,
                    )
                    db.add(ws)

            # Worker Availability
            days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
            for d in days:
                avail = WorkerAvailability(
                    worker_id=worker.id,
                    day_of_week=d,
                    start_time=time(9, 0),
                    end_time=time(18, 0),
                    is_available=True,
                )
                db.add(avail)

        # 4. Seed Customer User
        logger.info("Seeding Customer User...")
        customer = db.query(User).filter(User.email == "customer@shramigo.com").first()
        if not customer:
            customer = User(
                full_name="Priya Sharma",
                email="customer@shramigo.com",
                phone="7777777777",
                password_hash=hash_password("customer123"),
                role=UserRole.CUSTOMER,
                is_active=True,
                is_verified=True,
            )
            db.add(customer)
            db.flush()

            # Customer Profile
            c_profile = CustomerProfile(
                user_id=customer.id,
                address="456 Park Avenue",
                city="Mumbai",
                state="Maharashtra",
                pincode="400002",
                bio="Regular customer",
                latitude=19.0800,
                longitude=72.8800,
            )
            db.add(c_profile)

        db.commit()
        logger.info("Seeding completed successfully!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
