from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models import User as DBUser
from app.schemas import UserSimpleResponse

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=List[UserSimpleResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Returns all registered users (for user assignment selection fields)."""
    users = db.query(DBUser).all()
    return users
