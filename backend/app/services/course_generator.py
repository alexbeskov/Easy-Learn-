from __future__ import annotations

from textwrap import dedent

from app.config import Settings
from app.schemas import CourseModule, CourseResponse, GenerateCourseRequest, SourceSummary
from app.services.content_extractor import ExtractedSource, extract_source
from app.services.polza_client import PolzaClient


def build_prompt(request: GenerateCourseRequest, sources: list[ExtractedSource]) -> str:
    topic = request.topic or "Combined learning topic"
    source_blocks = []
    for index, source in enumerate(sources, start=1):
        source_blocks.append(
            dedent(
                f"""
                Source {index}
                URL: {source.url}
                Type: {source.kind}
                Title: {source.title}
                Excerpt: {source.excerpt}
                Raw text:
                {source.raw_text}
                """
            ).strip()
        )
    joined_sources = "\n\n".join(source_blocks)

    return dedent(
        f"""
        You are building a mini-course for self-learners.
        Topic hint: {topic}

        Create a response as JSON with this exact shape:
        {{
          "title": "string",
          "summary": "string",
          "modules": [
            {{
              "title": "string",
              "goal": "string",
              "content": "string",
              "key_points": ["string"]
            }}
          ],
          "takeaways": ["string"],
          "next_steps": ["string"],
          "sources": [
            {{
              "url": "string",
              "kind": "youtube|article",
              "title": "string",
              "status": "processed|failed",
              "excerpt": "string"
            }}
          ],
          "warnings": ["string"]
        }}

        Requirements:
        - Return 3 to 7 modules.
        - Explain ideas in simple but smart language.
        - Make the lesson coherent even when sources overlap.
        - Include practical advice and what to learn next.
        - Keep source objects aligned with the provided materials.

        Materials:
        {joined_sources}
        """
    ).strip()


async def generate_course(request: GenerateCourseRequest, settings: Settings) -> CourseResponse:
    extracted_sources = await _collect_sources(request, settings)
    prompt = build_prompt(request, extracted_sources)
    polza_client = PolzaClient(settings)

    warnings = [
        f"Could not fully process source: {source.url}"
        for source in extracted_sources
        if source.status != "processed"
    ]

    try:
        ai_response = await polza_client.generate_course(prompt)
    except Exception as exc:
        warnings.append(f"Polza AI request failed. Fallback mode used: {exc}")
        ai_response = None

    if ai_response is None:
        return _fallback_course(request, extracted_sources, warnings)

    ai_response.warnings = [*ai_response.warnings, *warnings]
    if not ai_response.sources:
        ai_response.sources = [_to_source_summary(source) for source in extracted_sources]
    return ai_response


async def _collect_sources(request: GenerateCourseRequest, settings: Settings) -> list[ExtractedSource]:
    results: list[ExtractedSource] = []
    for url in request.urls:
        source = await extract_source(str(url), settings.request_timeout_seconds)
        results.append(source)
    return results


def _fallback_course(
    request: GenerateCourseRequest,
    extracted_sources: list[ExtractedSource],
    warnings: list[str],
) -> CourseResponse:
    topic = request.topic or _derive_topic_from_sources(extracted_sources)

    modules = [
        CourseModule(
            title="Orientation",
            goal=f"Understand why {topic} matters and what the available sources cover.",
            content=(
                f"This module maps the learning space around {topic}. It highlights the scope of the"
                " source set and frames the core questions the learner should answer first."
            ),
            key_points=[
                f"Define the main outcome you want from studying {topic}.",
                "Notice how the sources approach the topic from different angles.",
                "Start with the concepts that repeat across multiple sources.",
            ],
        ),
        CourseModule(
            title="Core concepts",
            goal=f"Build a strong conceptual base for {topic}.",
            content=(
                "Extract the recurring ideas, terms, and frameworks from the submitted sources."
                " Learn the vocabulary first so advanced details make sense later."
            ),
            key_points=[
                "Group similar ideas into a shared mental model.",
                "Translate abstract concepts into plain language.",
                "Capture the 3 to 5 ideas that appear most often.",
            ],
        ),
        CourseModule(
            title="Applied practice",
            goal="Turn the material into a repeatable learning or work habit.",
            content=(
                "Use examples, workflows, and exercises inspired by the source set. The learner should"
                " leave this module with a concrete action plan."
            ),
            key_points=[
                "Test one idea immediately after learning it.",
                "Compare examples from video and article sources.",
                "Write a short reflection or summary after each study session.",
            ],
        ),
    ]

    if len(extracted_sources) >= 3:
        modules.append(
            CourseModule(
                title="Synthesis and next horizon",
                goal="Connect the material into a bigger skill path.",
                content=(
                    "This module combines the strongest parts of the submitted sources into a bigger"
                    " learning roadmap and highlights what to study next."
                ),
                key_points=[
                    "Merge repeated patterns into one study system.",
                    "Decide which skill gap should be closed next.",
                    "Pick one advanced resource to continue the journey.",
                ],
            )
        )

    summary = (
        f"Easy Learn built this mini-course around {topic} using {len(extracted_sources)} sources. "
        "The lesson is structured to help a learner move from orientation to practical application"
        " even when some source metadata is incomplete."
    )

    return CourseResponse(
        title=topic.title(),
        summary=summary,
        modules=modules,
        takeaways=[
            f"{topic.title()} becomes easier when you organize scattered resources into one path.",
            "Repeated ideas across different sources usually signal the real fundamentals.",
            "Practical application should happen alongside reading and watching, not after.",
        ],
        next_steps=[
            "Review the modules and turn the key points into a checklist.",
            "Open the original sources in the same order as the course modules.",
            "Add 2 to 3 more focused sources and regenerate for a deeper version.",
        ],
        sources=[_to_source_summary(source) for source in extracted_sources],
        warnings=warnings,
    )


def _derive_topic_from_sources(extracted_sources: list[ExtractedSource]) -> str:
    for source in extracted_sources:
        title = source.title.strip()
        if title and title.lower() not in {"untitled article", "unavailable article"}:
            return title
    return "Custom learning path"


def _to_source_summary(source: ExtractedSource) -> SourceSummary:
    return SourceSummary(
        url=source.url,
        kind=source.kind,
        title=source.title,
        status=source.status,
        excerpt=source.excerpt,
    )
