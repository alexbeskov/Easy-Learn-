from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers.course import router as course_router

settings = get_settings()
BASE_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(course_router)
app.mount("/preview", StaticFiles(directory=FRONTEND_DIR), name="preview")


@app.get("/", include_in_schema=False)
async def preview_index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "preview.html")
