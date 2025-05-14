from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import date
import models
import schemas
from database import get_db
from auth import get_current_active_user, get_current_admin_user

router = APIRouter()

# Ensure the directory exists
def ensure_dir(directory):
    os.makedirs(directory, exist_ok=True)

# Helper function to save uploaded file
async def save_upload_file(upload_file: UploadFile, destination: str):
    ensure_dir(os.path.dirname(destination))
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return destination

@router.get("/", response_model=List[schemas.Event])
async def get_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    events = db.query(models.Event).filter(models.Event.is_active == True).offset(skip).limit(limit).all()
    return events

@router.get("/{event_id}", response_model=schemas.Event)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/", response_model=schemas.Event)
async def create_event(
    title: str,
    description: str,
    date: date,
    location: str = None,
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Create event in database first to get the ID
    db_event = models.Event(
        title=title,
        description=description,
        date=date,
        location=location,
        organizer_id=current_user.id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    # Handle image upload if provided
    if image:
        # Create directory if it doesn't exist
        static_dir = os.path.join("static", "completedEvents")
        ensure_dir(static_dir)
        
        # Get file extension and create filename
        file_extension = os.path.splitext(image.filename)[1]
        filename = f"event_{db_event.id}{file_extension}"
        file_path = os.path.join(static_dir, filename)
        
        # Save file
        await save_upload_file(image, file_path)
        
        # Update image_url in database
        db_event.image_url = f"/static/completedEvents/{filename}"
        db.commit()
        db.refresh(db_event)
    
    return db_event

@router.put("/{event_id}", response_model=schemas.Event)
async def update_event(
    event_id: int,
    title: str = None,
    description: str = None,
    date: date = None,
    location: str = None,
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if db_event.organizer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this event")
    
    # Update text fields if provided
    if title is not None:
        db_event.title = title
    if description is not None:
        db_event.description = description
    if date is not None:
        db_event.date = date
    if location is not None:
        db_event.location = location
    
    # Handle image upload if provided
    if image:
        # Remove old image if exists
        if db_event.image_url and os.path.exists(db_event.image_url.replace("/static/", "static/")):
            try:
                os.remove(db_event.image_url.replace("/static/", "static/"))
            except OSError:
                pass
        
        # Create directory if it doesn't exist
        static_dir = os.path.join("static", "completedEvents")
        ensure_dir(static_dir)
        
        # Get file extension and create filename
        file_extension = os.path.splitext(image.filename)[1]
        filename = f"event_{event_id}{file_extension}"
        file_path = os.path.join(static_dir, filename)
        
        # Save file
        await save_upload_file(image, file_path)
        
        # Update image_url in database
        db_event.image_url = f"/static/completedEvents/{filename}"
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
async def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if db_event.organizer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
    
    db_event.is_active = False
    db.commit()
    return {"message": "Event deleted successfully"} 