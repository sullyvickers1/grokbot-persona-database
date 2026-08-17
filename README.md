# Grokbot Persona Database

**The definitive open-source collection of schema-validated personas for Grok and other LLMs.**

Sixty carefully distinct voices — not a dump of “act as” one-liners. Every persona is a versioned tool: a job, a thinking process, a speaking contract, hard refusals, and three worked examples. The collection is validated against a public JSON Schema on every change.

If you are building a product, a research stack, or a personal Grok setup and you are tired of prompt folklore, this is the library to depend on.

---

## Why this exists

Most public prompt lists fail in the same three ways:

1. **They are not distinct.** Five “wise mentors” and three “expert engineers” that collapse into the same voice.
2. **They are not tools.** Personality flavor without an output contract, a refusal list, or a test.
3. **They are not a database.** No schema, no versions, no uniqueness test, no way to scale without rotting.

This repository treats personas the way a serious project treats APIs.

- **One job per persona.** Neighbors are listed so you do not grab the almost-right voice.
- **A hard schema.** Files that do not validate do not ship.
- **Worked examples.** Three situations, not one happy-path greeting.
- **Stable IDs.** Rename is a breaking change. Deprecate and point at a successor.

## What's inside

| Category | Count | What you get |
| --- | ---: | --- |
| Professional / Expert | 20 | Practitioners with a method — systems, science, law, medicine, markets, security, infrastructure, and more |
| Creative | 12 | Makers who can ship a line, a cut, a scene, or a system of taste |
| Personality archetypes | 14 | Reusable stances for *how* a conversation should think |
| Specialized / Utility | 10 | Job-shaped tools: tutor, coach, reviewer, facilitator, analyst |
| Fun / Experimental | 4 | Strange voices that remain useful under pressure |
| **Total** | **60** | |

Browse the machine index in [`catalog.json`](catalog.json). Browse the files in [`personas/`](personas/).

## Quick start

### 1. Copy a system prompt

Open any file in `personas/<category>/<id>.yaml` and paste `system_prompt` into Grok (or any chat-completions `system` message). Start from the persona’s `compatibility.recommended_temperature`.

### 2. Load one programmatically

```js
import { loadPersona, toMessages } from "./examples/load-persona.mjs";

const persona = await loadPersona("ada-vale");
const messages = toMessages(persona, "The p99 just doubled after we enabled retries.");
```

Python:

```python
from examples.load_persona import load_persona, to_messages

persona = load_persona("ada-vale")
messages = to_messages(persona, "The p99 just doubled after we enabled retries.")
```

### 3. Validate the collection

```bash
npm install
npm run validate   # schema + uniqueness + folder contract
npm run index      # regenerates catalog.json
```

## Repository layout

```text
personas/          YAML source of truth, one file per persona, grouped by category
schemas/           JSON Schema for a persona and for catalog.json
examples/          Loaders (JS, Python) and a composed session
templates/         Blank and minimal templates for new personas
docs/              Format, best practices, categories, versioning
scripts/           validate-personas.mjs, index-catalog.mjs
catalog.json       Generated index (id, name, tags, path) — do not hand-edit
```

## Design rules (the short version)

A persona is accepted only if it clears all of these:

1. **Uniqueness test.** Three sentences it would say that a listed neighbor would not.
2. **Five-part system prompt.** Identity, thinking process, speech contract, output contract, hard rules.
3. **Schema 1.1.0.** Including three example interactions in different situations.
4. **Honest lane.** No fake citations, no playing doctor/lawyer of record, no exploit kits.
5. **Job, not costume.** If removing the name does not change the answers, it is not a persona.

Full bar: [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/best-practices.md`](docs/best-practices.md).

## Versioning

- **Collection** follows semver on the repo tag.
- **Each persona** has its own `version`. `MAJOR` = behavior break, `MINOR` = new capability, `PATCH` = copy edit.
- **IDs never rename.** Deprecate and set `successor_id`.

See [`docs/versioning.md`](docs/versioning.md).

## License

[MIT](LICENSE). Use the personas in products, research, and personal setups. Attribution is appreciated, not required.

## Status

v1.0.0 — 60 curated personas, schema 1.1.0, public catalog index.
