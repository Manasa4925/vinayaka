from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "User"  # "Admin" or "User"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class UserSimpleResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
        orm_mode = True


# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "Medium"  # "Low", "Medium", "High"
    status: str = "To Do"  # "To Do", "In Progress", "Completed"
    due_date: datetime
    assigned_user_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_user_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    assigned_user: Optional[UserSimpleResponse] = None

    class Config:
        from_attributes = True
        orm_mode = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str  # Can be username or email
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str
