from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True

# Member schemas
class MemberBase(BaseModel):
    name: str
    position: str
    age: int
    photo: Optional[str] = None
    bio: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    age: Optional[int] = None
    photo: Optional[str] = None
    bio: Optional[str] = None

class Member(MemberBase):
    id: int

    class Config:
        from_attributes = True

# Event schemas
class EventBase(BaseModel):
    title: str
    description: str
    date: date
    location: Optional[str] = None
    image_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    location: Optional[str] = None
    image_url: Optional[str] = None

class Event(EventBase):
    id: int
    organizer_id: int
    is_active: bool

    class Config:
        from_attributes = True

# Donation schemas
class DonationBase(BaseModel):
    amount: int
    event_id: Optional[int] = None
    is_anonymous: Optional[bool] = False

class DonationCreate(DonationBase):
    pass

class Donation(DonationBase):
    id: int
    donor_id: int
    date: date

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# UpcomingEvent schemas
class UpcomingEventBase(BaseModel):
    title: str
    description: str
    date: date
    location: Optional[str] = None
    image_url: Optional[str] = None

class UpcomingEventCreate(UpcomingEventBase):
    pass

class UpcomingEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    location: Optional[str] = None
    image_url: Optional[str] = None

class UpcomingEvent(UpcomingEventBase):
    id: int
    organizer_id: int
    is_active: bool

    class Config:
        from_attributes = True 