from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil

from database import get_db
import models
import schemas
from auth import get_current_active_user, get_current_admin_user

router = APIRouter(
    prefix="/members",
    tags=["members"]
)

# Create directory for member images if it doesn't exist
STATIC_DIR = "static"
MEMBER_IMAGES_DIR = os.path.join(STATIC_DIR, "userimages")
os.makedirs(MEMBER_IMAGES_DIR, exist_ok=True)

@router.post("/", response_model=schemas.Member, status_code=status.HTTP_201_CREATED)
def create_member(
    member: schemas.MemberCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_admin_user)
):
    """Create a new team member (admin only)"""
    db_member = models.Member(
        name=member.name,
        position=member.position,
        age=member.age,
        photo=member.photo,
        bio=member.bio
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/", response_model=List[schemas.Member])
def read_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all team members"""
    members = db.query(models.Member).offset(skip).limit(limit).all()
    return members

@router.get("/{member_id}", response_model=schemas.Member)
def read_member(member_id: int, db: Session = Depends(get_db)):
    """Get a specific team member by ID"""
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.put("/{member_id}", response_model=schemas.Member)
def update_member(
    member_id: int,
    member_update: schemas.MemberUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_admin_user)
):
    """Update a team member (admin only)"""
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Update only the fields that are set
    update_data = member_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_member, key, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_admin_user)
):
    """Delete a team member (admin only)"""
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db.delete(db_member)
    db.commit()
    return None

# Add this new endpoint for member creation with image upload
@router.post("/with-image", response_model=schemas.Member)
async def create_member_with_image(
    name: str = Form(...),
    position: str = Form(...),
    age: int = Form(...),
    bio: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_admin_user)
):
    """Create a new team member with image upload"""
    
    # Handle image upload if provided
    photo_path = None
    if image and image.filename:
        # Generate unique filename
        file_ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        # Save file path relative to static directory
        relative_path = f"userimages/{unique_filename}"
        photo_path = relative_path
        
        # Full path to save the file
        file_path = os.path.join(MEMBER_IMAGES_DIR, unique_filename)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    
    # Create member in database
    db_member = models.Member(
        name=name,
        position=position,
        age=age,
        bio=bio,
        photo=photo_path  # Store the relative path
    )
    
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    
    return db_member 