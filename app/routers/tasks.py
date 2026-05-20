from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_current_admin
from app.models import Task as DBTask, User as DBUser
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """
    Returns tasks based on user role.
    - Admins get all tasks.
    - Standard users get only tasks assigned to them.
    """
    if current_user.role.strip().lower() == "admin":
        return db.query(DBTask).all()
    else:
        return db.query(DBTask).filter(DBTask.assigned_user_id == current_user.id).all()

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_admin)  # Restricted to Admins
):
    """Creates a new task. Admin privilege is required."""
    # If assignee user id is provided, verify they exist
    if task_in.assigned_user_id is not None:
        assignee = db.query(DBUser).filter(DBUser.id == task_in.assigned_user_id).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Assigned user with ID {task_in.assigned_user_id} does not exist."
            )
            
    db_task = DBTask(
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority,
        status=task_in.status,
        due_date=task_in.due_date,
        assigned_user_id=task_in.assigned_user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Fetches a specific task. Access is restricted to Admins and the assignee."""
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
        
    # Check permissions
    if current_user.role.strip().lower() != "admin" and db_task.assigned_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to view this task."
        )
        
    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """
    Updates a task's details.
    - Admins can modify any field.
    - Users can ONLY modify the 'status' field of their assigned tasks.
    """
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
        
    # Standard role gate: Check if user has access to this task
    if current_user.role.strip().lower() != "admin" and db_task.assigned_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to update this task."
        )
        
    # Extract update payload dictionary safely across Pydantic v1/v2
    update_dict = (
        task_in.model_dump(exclude_unset=True)
        if hasattr(task_in, "model_dump")
        else task_in.dict(exclude_unset=True)
    )
    
    # Strict validation gate for standard users
    if current_user.role.strip().lower() != "admin":
        # Check if the user is trying to update fields other than "status"
        invalid_keys = [key for key in update_dict.keys() if key != "status"]
        if invalid_keys:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Standard users are only permitted to update the 'status' field. Cannot modify: {', '.join(invalid_keys)}."
            )
            
    # Validate assignee if modified by Admin
    if "assigned_user_id" in update_dict and update_dict["assigned_user_id"] is not None:
        assignee = db.query(DBUser).filter(DBUser.id == update_dict["assigned_user_id"]).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Assigned user with ID {update_dict['assigned_user_id']} does not exist."
            )

    # Perform updates
    for field, value in update_dict.items():
        setattr(db_task, field, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_admin)  # Restricted to Admins
):
    """Deletes a task. Admin privilege is required."""
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
        
    db.delete(db_task)
    db.commit()
    return None
