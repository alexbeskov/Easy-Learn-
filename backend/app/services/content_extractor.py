from __future__ import annotations

import ipaddress
import re
import socket
from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse

import httpx
from bs4 import BeautifulSoup


YOUTUBE_HOSTS = {
    "youtu.be",
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
}

MAX_CONTENT_SIZE = 1 * 1024 * 1024  # 1MB limit for safety


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


def is_safe_url(url: str) -> bool:
    """ Basic SSRF protection: check if the URL resolves to a private or loopback address. """
    try:
        parsed = urlparse(url)
        if not parsed.scheme or parsed.scheme not in ("http", "https"):
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        # Check if it's an IP literal
        try:
            ip = ipaddress.ip_address(hostname)
            return not (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast)
        except ValueError:
            pass

        # Resolve hostname
        addr_info = socket.getaddrinfo(hostname, None)
        for family, kind, proto, canonname, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast:
                return False

        return True
    except Exception:
        return False


def _youtube_video_id(url: str) -> str | None:
    parsed = urlparse(url)
    if parsed.netloc.lower() == "youtu.be":
        return parsed.path.strip("/") or None
    if "youtube" in parsed.netloc.lower():
        return parse_qs(parsed.query).get("v", [None])[0]
    return None


async def extract_source(url: str, timeout_seconds: float) -> ExtractedSource:
    if not is_safe_url(url):
        return ExtractedSource(
            url=url,
            kind=classify_url(url),
            title="Blocked URL",
            excerpt="This URL was blocked for security reasons.",
            status="failed",
            raw_text="Blocked URL (SSRF protection)",
        )

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
            # First check headers to avoid large files
            async with client.stream("GET", url, headers={"User-Agent": "EasyLearnBot/1.0 (+https://example.com)"}) as response:
                response.raise_for_status()

                content_type = response.headers.get("Content-Type", "").lower()
                if "text/html" not in content_type:
                    return ExtractedSource(
                        url=url,
                        kind="article",
                        title="Unsupported content type",
                        excerpt="Only HTML pages are supported.",
                        status="failed",
                        raw_text=f"Unsupported Content-Type: {content_type}",
                    )

                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > MAX_CONTENT_SIZE:
                    return ExtractedSource(
                        url=url,
                        kind="article",
                        title="Page too large",
                        excerpt="The article is too large to process.",
                        status="failed",
                        raw_text="Content length exceeded limit",
                    )

                chunks = []
                bytes_read = 0
                async for chunk in response.aiter_bytes():
                    bytes_read += len(chunk)
                    if bytes_read > MAX_CONTENT_SIZE:
                        break
                    chunks.append(chunk)

                html = b"".join(chunks).decode("utf-8", errors="replace")
    except Exception as exc:
        return ExtractedSource(
            url=url,
            kind="article",
            title="Unavailable article",
            excerpt="This source could not be fetched, but it may still inform the lesson topic.",
            status="failed",
            raw_text=str(exc),
        )

    soup = BeautifulSoup(html, "html.parser")

    # Remove script and style elements
    for script_or_style in soup(["script", "style", "noscript", "iframe", "header", "footer", "nav"]):
        script_or_style.decompose()

    title = _extract_title(soup)
    excerpt = _extract_excerpt(soup)
    cleaned_text = _extract_text(soup)
    raw_text = cleaned_text[:10000] # Increased limit for AI processing

    return ExtractedSource(
        url=url,
        kind="article",
        title=title,
        excerpt=excerpt,
        status="processed",
        raw_text=raw_text or excerpt,
    )


def _extract_title(soup: BeautifulSoup) -> str:
    # Try Open Graph or Twitter first
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        return og_title["content"].strip()

    twitter_title = soup.find("meta", name="twitter:title")
    if twitter_title and twitter_title.get("content"):
        return twitter_title["content"].strip()

    if soup.title and soup.title.string:
        return soup.title.string.strip()

    h1 = soup.find("h1")
    if h1:
        return h1.get_text().strip()

    return "Untitled article"


def _extract_excerpt(soup: BeautifulSoup) -> str:
    # Try meta description
    desc = soup.find("meta", name="description") or soup.find("meta", property="og:description")
    if desc and desc.get("content"):
        return desc["content"].strip()

    # Fallback to first paragraph
    p = soup.find("p")
    if p:
        return p.get_text().strip()[:200]

    return "No excerpt available."


def _extract_text(soup: BeautifulSoup) -> str:
    # Simple strategy: get all paragraph text
    paragraphs = soup.find_all("p")
    text = " ".join(p.get_text() for p in paragraphs)
    # If no paragraphs, just get everything
    if not text.strip():
        text = soup.get_text()

    return re.sub(r"\s+", " ", text).strip()
