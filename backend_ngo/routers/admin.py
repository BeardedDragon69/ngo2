from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from auth import get_password_hash, get_current_admin_user

router = APIRouter(
    tags=["admin"]
)

@router.post("/create", response_model=schemas.User)
async def create_admin(
    new_admin: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)  # Only admins can create other admins
):
    """
    Create a new admin user. Requires admin privileges.
    """
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        (models.User.email == new_admin.email) |
        (models.User.username == new_admin.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new admin user
    db_user = models.User(
        email=new_admin.email,
        username=new_admin.username,
        hashed_password=get_password_hash(new_admin.password),
        first_name=new_admin.first_name,
        last_name=new_admin.last_name,
        is_active=True,
        is_admin=True  # Set as admin
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/list", response_model=List[schemas.User])
async def list_admins(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)  # Only admins can view admin list
):
    """
    Get a list of all admin users. Requires admin privileges.
    """
    admins = db.query(models.User).filter(
        models.User.is_admin == True,
        models.User.is_active == True
    ).offset(skip).limit(limit).all()
    
    return admins

@router.delete("/delete/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)  # Only admins can delete users
):
    """
    Delete a user by ID. Requires admin privileges.
    """
    # Prevent admins from deleting themselves
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot delete their own accounts"
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return None

@router.put("/update/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)  # Only admins can update users
):
    """
    Update a user by ID. Requires admin privileges.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields if provided in the request
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.username is not None:
        user.username = user_update.username
    if user_update.first_name is not None:
        user.first_name = user_update.first_name
    if user_update.last_name is not None:
        user.last_name = user_update.last_name
    if user_update.profile_image is not None:
        user.profile_image = user_update.profile_image
    
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/seed-admin", status_code=status.HTTP_201_CREATED)
async def seed_first_admin(
    db: Session = Depends(get_db)
):
    """
    Create a first admin user if none exists. This endpoint is public but will
    only work if no admin users exist in the database.
    """
    # Check if any admin exists
    admin_exists = db.query(models.User).filter(models.User.is_admin == True).first()
    if admin_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists. Use regular admin creation endpoint."
        )
    
    # Create a default admin
    default_admin = models.User(
        email="admin@example.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),  # Change this in production!
        first_name="Admin",
        last_name="User",
        is_active=True,
        is_admin=True
    )
    
    db.add(default_admin)
    db.commit()
    db.refresh(default_admin)
    
    return {"message": "Initial admin user created successfully"} 