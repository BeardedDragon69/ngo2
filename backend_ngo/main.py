from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
import os

import models
import schemas
from database import engine, get_db
from auth import (
    # ?ggs
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from routers import events, admin, users, members, upcoming_events

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Ensure static directories exist
os.makedirs(os.path.join("static", "completedEvents"), exist_ok=True)
os.makedirs(os.path.join("static", "upcomingEvents"), exist_ok=True)

app = FastAPI(
    title="NGO API",
    description="API for NGO Project",
    version="1.0.0"
)

# Configure CORS - improved version
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily for troubleshooting
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Set-Cookie", "Access-Control-Allow-Headers", 
                  "Access-Control-Allow-Origin", "Authorization", "Accept"],
    expose_headers=["Content-Type", "Set-Cookie", "Access-Control-Allow-Headers", 
                   "Access-Control-Allow-Origin"]
)

# Include routers
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(upcoming_events.router, prefix="/api/upcoming-events", tags=["upcoming-events"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(members.router, prefix="/api/members", tags=["members"])

# Mount static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Token endpoint
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
async def root():
    return {"message": "Welcome to NGO API"} 