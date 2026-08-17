# Usage

## In Grok (or any chat UI)

1. Pick a persona by **job**, then confirm against `related_personas`.
2. Copy `system_prompt` into the system / instructions field.
3. Set temperature near `compatibility.recommended_temperature`.
4. Paste the user’s actual artifacts (logs, drafts, tables). Personas degrade when starved of facts.
5. If the model drifts, paste one `example_interactions` pair as a few-shot.

## In an API

See [`examples/load-persona.mjs`](../examples/load-persona.mjs) and [`examples/load_persona.py`](../examples/load_persona.py).

The loader returns the full object. `to_messages(persona, user_text)` builds:

```json
[
  { "role": "system", "content": "<system_prompt>" },
  { "role": "user", "content": "<user_text>" }
]
```

You may prepend one or two example pairs as additional `user` / `assistant` messages for stubborn models.

## Composing two personas

Do not concatenate two full system prompts. They will fight.

Supported pattern (see `examples/compose-system-prompt.md`):

- One **lead** persona owns the output contract.
- A second persona contributes a short “consulted voice” paragraph (8–12 lines), not its full prompt.

Example: Ada Vale leads an incident; Nia Okonkwo contributes a threat-boundary paragraph.

## Product integration

- Pin both **collection tag** and **persona version**.
- Treat a MAJOR persona bump as you would a breaking API.
- Do not rewrite `system_prompt` in your app without forking the ID.
- Cache `catalog.json` for navigation; load YAML at request time if you need the full prompt.

## What not to do

- Do not strip hard rules to “make it nicer.”
- Do not use a professional persona as a licensed professional.
- Do not ship experimental voices (especially Grit or Night Frequency) into a regulated customer channel without a human policy review.
