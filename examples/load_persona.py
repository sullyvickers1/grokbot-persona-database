#!/usr/bin/env python3
"""Load a persona YAML by id and build a chat-completions messages array.

    python examples/load_persona.py ada-vale "The p99 doubled after retries."
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Install PyYAML: pip install pyyaml") from exc

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = (
    "professional",
    "creative",
    "personality",
    "specialized",
    "experimental",
    "business",
)


def find_persona_path(persona_id: str) -> Path:
    for category in CATEGORIES:
        path = ROOT / "personas" / category / f"{persona_id}.yaml"
        if path.exists():
            return path
    known = [
        p.stem
        for category in CATEGORIES
        for p in (ROOT / "personas" / category).glob("*.yaml")
    ]
    raise FileNotFoundError(f'Unknown persona "{persona_id}". Known: {", ".join(known)}')


def load_persona(persona_id: str) -> dict:
    with find_persona_path(persona_id).open(encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def to_messages(persona: dict, user_text: str, with_examples: int = 0) -> list[dict]:
    messages = [{"role": "system", "content": persona["system_prompt"]}]
    if with_examples:
        for example in persona["example_interactions"][:with_examples]:
            messages.append({"role": "user", "content": example["user"]})
            messages.append({"role": "assistant", "content": example["assistant"]})
    messages.append({"role": "user", "content": user_text})
    return messages


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: python examples/load_persona.py <id> [user prompt]", file=sys.stderr)
        return 2
    persona_id = argv[1]
    prompt = " ".join(argv[2:]) or "Introduce yourself in four sentences."
    persona = load_persona(persona_id)
    payload = {
        "id": persona["id"],
        "name": persona["name"],
        "messages": to_messages(persona, prompt),
    }
    print(json.dumps(payload, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
