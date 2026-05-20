import os
import sys
import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("seed")

# Ensure backend directory is in sys.path so we can import app modules
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    from sqlalchemy.orm import Session
    from app.database import SessionLocal, Base, engine
    from app.models import User, Task
    from app.auth import get_password_hash
except ModuleNotFoundError as e:
    logger.error(f"Failed to import app modules: {e}")
    logger.error("Please run the script from the 'backend' directory or ensure it's in the python path.")
    sys.exit(1)

def seed_database():
    logger.info("Initializing database schemas...")
    # This automatically creates all tables defined in models if they do not exist yet
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        logger.info("Seeding users...")
        
        # 1. Define seed users
        seed_users = [
            {
                "username": "manasa_18",
                "email": "manasa.kadavakollu@gmail.com",
                "password": "Password123!",
                "role": "Admin"
            },
            {
                "username": "testuser",
                "email": "testuser@example.com",
                "password": "Password123!",
                "role": "User"
            },
            {
                "username": "janakamma_2005",
                "email": "chundujanakamma368@gmail.com",
                "password": "Password123!",
                "role": "User"
            }
        ]
        
        user_map = {} # Store user models mapped by username to easily link task assignments
        
        for u_data in seed_users:
            # Check if user already exists
            existing_user = db.query(User).filter((User.username == u_data["username"]) | (User.email == u_data["email"])).first()
            if not existing_user:
                logger.info(f"Creating user: {u_data['username']} ({u_data['role']})")
                hashed_pw = get_password_hash(u_data["password"])
                db_user = User(
                    username=u_data["username"],
                    email=u_data["email"],
                    hashed_password=hashed_pw,
                    role=u_data["role"]
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                user_map[u_data["username"]] = db_user
            else:
                logger.info(f"User {u_data['username']} already exists.")
                user_map[u_data["username"]] = existing_user
                
        logger.info("Seeding tasks...")
        
        # 2. Define seed tasks
        seed_tasks = [
            {
                "title": "Create Presentation",
                "description": "Create a PPT presentation on green technology and sustainability initiatives.",
                "priority": "Medium",
                "status": "To Do",
                "due_date": datetime.datetime.utcnow() + datetime.timedelta(days=3),
                "assigned_to": "janakamma_2005"
            },
            {
                "title": "Database Schema Setup",
                "description": "Initialize database, configure PostgreSQL using Docker Compose, and establish relation mappings.",
                "priority": "High",
                "status": "In Progress",
                "due_date": datetime.datetime.utcnow() + datetime.timedelta(days=1),
                "assigned_to": "testuser"
            },
            {
                "title": "Security Audit & JWT Auth",
                "description": "Audit authentication flows, verify JWT refresh token mechanisms, and confirm endpoint access rules.",
                "priority": "High",
                "status": "Completed",
                "due_date": datetime.datetime.utcnow() - datetime.timedelta(days=1),
                "assigned_to": "manasa_18"
            },
            {
                "title": "Develop Frontend Dashboard UI",
                "description": "Code custom dashboard analytics cards, task boards, and filter mechanics using React + Tailwind.",
                "priority": "Medium",
                "status": "To Do",
                "due_date": datetime.datetime.utcnow() + datetime.timedelta(days=5),
                "assigned_to": "janakamma_2005"
            }
        ]
        
        for t_data in seed_tasks:
            # Check if task already exists by title
            existing_task = db.query(Task).filter(Task.title == t_data["title"]).first()
            if not existing_task:
                assignee = user_map.get(t_data["assigned_to"])
                assignee_id = assignee.id if assignee else None
                
                logger.info(f"Creating task: {t_data['title']} (Assigned to: {t_data['assigned_to']})")
                db_task = Task(
                    title=t_data["title"],
                    description=t_data["description"],
                    priority=t_data["priority"],
                    status=t_data["status"],
                    due_date=t_data["due_date"],
                    assigned_user_id=assignee_id
                )
                db.add(db_task)
            else:
                logger.info(f"Task '{t_data['title']}' already exists.")
                
        db.commit()
        logger.info("Database seeding successfully completed!")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error during seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
