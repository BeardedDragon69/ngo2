from sqlalchemy import Boolean, Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    profile_image = Column(String, nullable=True)

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    position = Column(String)
    age = Column(Integer)
    photo = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    date = Column(Date)
    location = Column(String)
    image_url = Column(String, nullable=True)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)

    organizer = relationship("User", back_populates="events")

User.events = relationship("Event", back_populates="organizer")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Integer)
    donor_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    date = Column(Date)
    is_anonymous = Column(Boolean, default=False)
    
    donor = relationship("User")
    event = relationship("Event")

class UpcomingEvent(Base):
    __tablename__ = "upcoming_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    date = Column(Date)
    location = Column(String)
    image_url = Column(String, nullable=True)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)

    organizer = relationship("User", back_populates="upcoming_events")

# Add the missing relationship to User
User.upcoming_events = relationship("UpcomingEvent", back_populates="organizer") 