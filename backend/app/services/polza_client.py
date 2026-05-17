from __future__ import annotations

import json
from typing import Any

import httpx

from app.config import Settings
from app.schemas import CourseResponse


class PolzaClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def generate_course(self, prompt: str) -> CourseResponse | None:
        if not self.settings.polza_enabled:
            return None

        payload: dict[str, Any] = {
            "input": prompt,
            "response_format": "json",
        }
        if self.settings.polza_model:
            payload["model"] = self.settings.polza_model

        headers = {
            "Authorization": f"Bearer {self.settings.polza_api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(
            timeout=self.settings.request_timeout_seconds,
            follow_redirects=True,
        ) as client:
            response = await client.post(self.settings.polza_api_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        normalized = self._extract_json_content(data)
        if not normalized:
            return None
        return CourseResponse.model_validate(normalized)

    def _extract_json_content(self, payload: dict[str, Any]) -> dict[str, Any] | None:
        if isinstance(payload.get("course"), dict):
            return payload["course"]

        direct_keys = {"title", "summary", "modules", "takeaways", "next_steps", "sources", "warnings"}
        if direct_keys.issubset(payload.keys()):
            return payload

        for key in ("output_text", "text", "content"):
            if isinstance(payload.get(key), str):
                return self._safe_json_loads(payload[key])

        choices = payload.get("choices")
        if isinstance(choices, list):
            for choice in choices:
                if not isinstance(choice, dict):
                    continue
                message = choice.get("message")
                if isinstance(message, dict):
                    content = message.get("content")
                    if isinstance(content, str):
                        return self._safe_json_loads(content)
                if isinstance(choice.get("text"), str):
                    return self._safe_json_loads(choice["text"])
        return None

    @staticmethod
    def _safe_json_loads(value: str) -> dict[str, Any] | None:
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return None
        return parsed if isinstance(parsed, dict) else None
