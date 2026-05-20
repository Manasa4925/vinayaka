from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.tasks import router as tasks_router

# Auto-create tables on startup (PostgreSQL if connected; SQLite otherwise)
# This guarantees immediate operability without manual database migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Role-Based Task Management API",
    description="Sleek, secure backend powering the Role-Based Task Management System.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local testing; restrict to specific domains in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)

@app.get("/")
def read_root():
    """Simple API status health check endpoint."""
    return {
        "status": "online",
        "message": "Role-Based Task Management System API is running successfully."
    }
