from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_user, get_password_hash

router = APIRouter(
    tags=["users"]
)

@router.post("/register", response_model=schemas.User)
async def register_user(
    new_user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user. This endpoint is public and doesn't require authentication.
    """
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        (models.User.email == new_user.email) |
        (models.User.username == new_user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new user
    db_user = models.User(
        email=new_user.email,
        username=new_user.username,
        hashed_password=get_password_hash(new_user.password),
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        is_active=True,
        is_admin=False  # Regular user by default
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/me", response_model=schemas.User)
async def read_user_me(
    current_user: models.User = Depends(get_current_user)
):
    """
    Get information about the currently logged-in user.
    """
    return current_user

@router.put("/me", response_model=schemas.User)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update information for the currently logged-in user.
    """
    for field, value in user_update.dict(exclude_unset=True).items():
        if value is not None:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[schemas.User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of all users. Must be authenticated to access this endpoint.
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users 