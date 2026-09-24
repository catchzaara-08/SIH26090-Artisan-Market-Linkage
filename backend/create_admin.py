from app.database.database import SessionLocal
from app.models.admin import AdminTable
from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


def create_admin():
    db = SessionLocal()

    try:
        existing_admin = (
            db.query(AdminTable)
            .filter(
                AdminTable.username == ADMIN_USERNAME
            )
            .first()
        )

        if existing_admin:
            print("Demo admin already exists.")
            return

        admin = AdminTable(
            admin_id="ADMIN-001",
            username=ADMIN_USERNAME,
            password_hash=password_hash.hash(
                ADMIN_PASSWORD
            ),
            role="admin",
        )

        db.add(admin)
        db.commit()

        print("Demo admin created successfully.")
        print("Username: admin")
        print("Password: admin123")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()