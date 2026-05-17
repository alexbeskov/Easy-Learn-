from pydantic import BaseModel, Field, HttpUrl, field_validator


class GenerateCourseRequest(BaseModel):
    topic: str | None = Field(default=None, max_length=160)
    urls: list[HttpUrl] = Field(min_length=1, max_length=12)

    @field_validator("topic")
    @classmethod
    def normalize_topic(cls, value: str | None) -> str | None:
        if value is None:
            return value
        trimmed = value.strip()
        return trimmed or None


class SourceSummary(BaseModel):
    url: HttpUrl
    kind: str
    title: str
    status: str
    excerpt: str | None = None


class CourseModule(BaseModel):
    title: str
    goal: str
    content: str
    key_points: list[str]


class CourseResponse(BaseModel):
    title: str
    summary: str
    modules: list[CourseModule]
    takeaways: list[str]
    next_steps: list[str]
    sources: list[SourceSummary]
    warnings: list[str]


class HealthResponse(BaseModel):
    status: str
    polza_configured: bool
