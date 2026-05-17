from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.schemas import CourseResponse, GenerateCourseRequest, HealthResponse
from app.services.course_generator import generate_course

router = APIRouter(prefix="/api", tags=["course"])


@router.get("/health", response_model=HealthResponse)
async def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(status="ok", polza_configured=settings.polza_enabled)


@router.post("/course/generate", response_model=CourseResponse)
async def create_course(
    payload: GenerateCourseRequest,
    settings: Settings = Depends(get_settings),
) -> CourseResponse:
    return await generate_course(payload, settings)
