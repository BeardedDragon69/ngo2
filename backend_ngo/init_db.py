from datetime import date
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from auth import get_password_hash

def init_db():
    db = SessionLocal()
    try:
        # Create admin user
        admin_user = models.User(
            email="admin@example.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            first_name="Admin",
            last_name="User",
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        # Create some test events
        events = [
            models.Event(
                title="Community Cleanup Drive",
                description="Join us for a community cleanup event to make our neighborhood cleaner and greener.",
                date=date(2024, 6, 15),
                location="Central Park",
                organizer_id=admin_user.id,
                is_active=True
            ),
            models.Event(
                title="Food Distribution",
                description="Help us distribute food to those in need in our community.",
                date=date(2024, 7, 1),
                location="Community Center",
                organizer_id=admin_user.id,
                is_active=True
            ),
            models.Event(
                title="Education Workshop",
                description="Free workshop on basic computer skills for underprivileged children.",
                date=date(2024, 7, 15),
                location="Public Library",
                organizer_id=admin_user.id,
                is_active=True
            )
        ]
        
        for event in events:
            db.add(event)
        
        db.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 