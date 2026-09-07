from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole


def seed_admin(
    email: str = "admin@shramigo.com",
    password: str = "admin123",
    full_name: str = "Administrator",
    phone: str = "9000000000",
):
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == email).first()
        if not admin_user:
            admin_user = User(
                full_name=full_name,
                email=email,
                phone=phone,
                password_hash=hash_password(password),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.commit()
            print(f"Created admin user: {email}")
        else:
            admin_user.password_hash = hash_password(password)
            admin_user.role = UserRole.ADMIN
            admin_user.is_active = True
            db.commit()
            print(f"Updated existing user to admin: {email}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
