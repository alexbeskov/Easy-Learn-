from fastapi import APIRouter, Depends, Request

from app.config import Settings, get_settings
from app.schemas import CourseResponse, GenerateCourseRequest, HealthResponse
from app.services.course_generator import generate_course
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/api", tags=["course"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/health", response_model=HealthResponse)
async def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(status="ok", polza_configured=settings.polza_enabled)


@router.post("/course/generate", response_model=CourseResponse)
@limiter.limit("5/minute")
async def create_course(
    request: Request,
    payload: GenerateCourseRequest,
    settings: Settings = Depends(get_settings),
) -> CourseResponse:
    return await generate_course(payload, settings)
