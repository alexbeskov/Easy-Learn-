from __future__ import annotations

import re
from dataclasses import dataclass
from html import unescape
from urllib.parse import parse_qs, urlparse

import httpx


YOUTUBE_HOSTS = {
    "youtu.be",
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
}


@dataclass
class ExtractedSource:
    url: str
    kind: str
    title: str
    excerpt: str
    status: str
    raw_text: str


def classify_url(url: str) -> str:
    host = urlparse(url).netloc.lower()
    return "youtube" if host in YOUTUBE_HOSTS else "article"


def _youtube_video_id(url: str) -> str | None:
    parsed = urlparse(url)
    if parsed.netloc.lower() == "youtu.be":
        return parsed.path.strip("/") or None
    if "youtube" in parsed.netloc.lower():
        return parse_qs(parsed.query).get("v", [None])[0]
    return None


async def extract_source(url: str, timeout_seconds: float) -> ExtractedSource:
    kind = classify_url(url)
    if kind == "youtube":
        return await _extract_youtube(url, timeout_seconds)
    return await _extract_article(url, timeout_seconds)


async def _extract_youtube(url: str, timeout_seconds: float) -> ExtractedSource:
    video_id = _youtube_video_id(url)
    fallback_title = f"YouTube lesson {video_id}" if video_id else "YouTube lesson"
    oembed_url = "https://www.youtube.com/oembed"

    try:
        async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True) as client:
            response = await client.get(oembed_url, params={"url": url, "format": "json"})
            response.raise_for_status()
            payload = response.json()
            title = payload.get("title") or fallback_title
            author = payload.get("author_name") or "Unknown creator"
            excerpt = f"Video by {author}. Use the lesson to extract the key concepts, examples, and steps."
            return ExtractedSource(
                url=url,
                kind="youtube",
                title=title,
                excerpt=excerpt,
                status="processed",
                raw_text=f"{title}. {excerpt}",
            )
    except Exception:
        excerpt = "Video metadata could not be fetched. Build the lesson from the topic and URL context."
        return ExtractedSource(
            url=url,
            kind="youtube",
            title=fallback_title,
            excerpt=excerpt,
            status="processed",
            raw_text=f"{fallback_title}. {excerpt}",
        )


async def _extract_article(url: str, timeout_seconds: float) -> ExtractedSource:
    try:
        async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True) as client:
            response = await client.get(
                url,
                headers={"User-Agent": "EasyLearnBot/1.0 (+https://example.com)"},
            )
            response.raise_for_status()
            html = response.text
    except Exception as exc:
        return ExtractedSource(
            url=url,
            kind="article",
            title="Unavailable article",
            excerpt="This source could not be fetched, but it may still inform the lesson topic.",
            status="failed",
            raw_text=str(exc),
        )

    title = _extract_title(html)
    excerpt = _extract_excerpt(html)
    cleaned = _extract_text(html)
    raw_text = cleaned[:6000]
    return ExtractedSource(
        url=url,
        kind="article",
        title=title,
        excerpt=excerpt,
        status="processed",
        raw_text=raw_text or excerpt,
    )


def _extract_title(html: str) -> str:
    for pattern in [
        r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\'](.*?)["\']',
        r'<meta[^>]+name=["\']twitter:title["\'][^>]+content=["\'](.*?)["\']',
        r"<title>(.*?)</title>",
    ]:
        match = re.search(pattern, html, flags=re.IGNORECASE | re.DOTALL)
        if match:
            return _clean_fragment(match.group(1))
    return "Untitled article"


def _extract_excerpt(html: str) -> str:
    for pattern in [
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
        r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\'](.*?)["\']',
    ]:
        match = re.search(pattern, html, flags=re.IGNORECASE | re.DOTALL)
        if match:
            return _clean_fragment(match.group(1))

    text = _extract_text(html)
    return text[:220] if text else "No excerpt available."


def _extract_text(html: str) -> str:
    sanitized = re.sub(r"<(script|style|noscript).*?>.*?</\1>", " ", html, flags=re.IGNORECASE | re.DOTALL)
    without_tags = re.sub(r"<[^>]+>", " ", sanitized)
    return _clean_fragment(without_tags)


def _clean_fragment(fragment: str) -> str:
    return re.sub(r"\s+", " ", unescape(fragment)).strip()
