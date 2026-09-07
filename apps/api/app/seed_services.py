from app.core.database import SessionLocal
from app.models.service import Service


SERVICES = [
    {
        "name": "Home Cleaning",
        "category": "Cleaning",
        "description": "Professional cleaning for homes and living spaces.",
        "base_price": 499,
        "icon": "Sparkles",
    },
    {
        "name": "Deep Cleaning",
        "category": "Cleaning",
        "description": "Detailed cleaning for kitchens, bathrooms and complete homes.",
        "base_price": 999,
        "icon": "Sparkles",
    },
    {
        "name": "Plumbing Repair",
        "category": "Plumbing",
        "description": "Repair leaking pipes, taps, fittings and common plumbing issues.",
        "base_price": 299,
        "icon": "Wrench",
    },
    {
        "name": "Electrical Repair",
        "category": "Electrical",
        "description": "Electrical installation, repair and troubleshooting services.",
        "base_price": 299,
        "icon": "Zap",
    },
    {
        "name": "Carpentry",
        "category": "Carpentry",
        "description": "Furniture repair, installation and general carpentry work.",
        "base_price": 399,
        "icon": "Hammer",
    },
    {
        "name": "Painting",
        "category": "Painting",
        "description": "Professional wall and room painting services.",
        "base_price": 799,
        "icon": "Paintbrush",
    },
    {
        "name": "AC Repair",
        "category": "Appliance Repair",
        "description": "AC inspection, servicing and repair.",
        "base_price": 399,
        "icon": "Snowflake",
    },
    {
        "name": "Appliance Repair",
        "category": "Appliance Repair",
        "description": "Repair and maintenance for common household appliances.",
        "base_price": 349,
        "icon": "Smartphone",
    },
    {
        "name": "Sofa Cleaning",
        "category": "Cleaning",
        "description": "Professional sofa and upholstery cleaning.",
        "base_price": 499,
        "icon": "Sofa",
    },
    {
        "name": "Driver Service",
        "category": "Driving",
        "description": "Reliable drivers for local and personal transportation needs.",
        "base_price": 399,
        "icon": "Car",
    },
]


def seed_services():
    db = SessionLocal()

    try:
        added = 0

        for service_data in SERVICES:
            existing = (
                db.query(Service)
                .filter(Service.name == service_data["name"])
                .first()
            )

            if existing:
                continue

            service = Service(**service_data)
            db.add(service)
            added += 1

        db.commit()

        print(f"Services seeded successfully. Added: {added}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_services()