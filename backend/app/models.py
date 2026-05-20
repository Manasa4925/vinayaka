import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="User", nullable=False)  # "Admin" or "User"
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationship to tasks: when user is deleted, their tasks' assigned_user_id will be handled by foreign key.
    # We will use cascade="all, delete-orphan" only if we want to delete their tasks. But in collaborative task management,
    # it is often better to keep tasks. Let's make the foreign key set NULL on delete and configure back_populates.
    tasks = relationship("Task", back_populates="assigned_user", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="Medium", nullable=False)  # "Low", "Medium", "High"
    status = Column(String, default="To Do", nullable=False)  # "To Do", "In Progress", "Completed"
    due_date = Column(DateTime, nullable=False)
    assigned_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationship to User
    assigned_user = relationship("User", back_populates="tasks")
