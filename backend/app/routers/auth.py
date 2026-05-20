from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, LoginRequest, Token, RefreshRequest
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user. Supports assigning 'Admin' or 'User' roles."""
    # Check if username exists
    existing_username = db.query(User).filter(User.username == user_in.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    existing_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Enforce valid roles case-insensitively and normalize to PascalCase
    role_lower = user_in.role.strip().lower()
    if role_lower == "admin":
        role = "Admin"
    else:
        role = "User"
        
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    """Log in and generate access and refresh tokens. Supports username or email login."""
    # Look up by email or username
    db_user = db.query(User).filter(
        (User.username == login_req.username) | (User.email == login_req.username)
    ).first()
    
    if not db_user or not verify_password(login_req.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, email, or password"
        )
        
    # Generate tokens with subject and role claims
    access_token = create_access_token(data={"sub": db_user.username, "role": db_user.role})
    refresh_token = create_refresh_token(data={"sub": db_user.username, "role": db_user.role})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        role=db_user.role,
        username=db_user.username
    )

@router.post("/refresh")
def refresh(refresh_req: RefreshRequest, db: Session = Depends(get_db)):
    """Verifies a refresh token and generates a new access token."""
    payload = verify_refresh_token(refresh_req.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
        
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload"
        )
        
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
        
    # Issue a fresh access token
    access_token = create_access_token(data={"sub": db_user.username, "role": db_user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
