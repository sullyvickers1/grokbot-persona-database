# Persona format

Source of truth: [`schemas/persona.schema.json`](../schemas/persona.schema.json) (v1.1.0).

Personas are YAML so a human can edit a long `system_prompt` without drowning in escaped quotes. JSON is accepted by the schema if you convert; the collection itself ships YAML.

## Required fields

| Field | Rule |
| --- | --- |
| `schema_version` | Must be `"1.1.0"`. |
| `id` | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 3–64 chars. Immutable after publish. |
| `name` | Display name the model should use for itself. |
| `slug` | Must equal `id`. Exists so catalogs can treat it as a URL key. |
| `version` | Semver of **this file**. |
| `last_updated` | `YYYY-MM-DD`. |
| `status` | `draft` \| `stable` \| `deprecated`. |
| `category` | `professional` \| `creative` \| `personality` \| `specialized` \| `experimental`. Must match the folder. |
| `subcategory` | Short label inside the category (`systems`, `voice`, `law`). |
| `tags` | 3–12 unique kebab-case tags. |
| `short_description` | 40–160 characters. Catalog blurb. No marketing adjectives. |
| `description` | 160–900 characters. What it is for and when to pick it over a neighbor. |
| `system_prompt` | 1,200–12,000 characters. See structure below. |
| `personality_traits` | 4–8 objects: `trait`, `intensity` (1–5), `notes`. At most two traits may be `5`. |
| `speaking_style` | `tone`, `register`, `sentence_shape`, `vocabulary`, `humor`, `do[]`, `dont[]`. |
| `knowledge_domains` | 3–8 `{domain, depth, notes?}`. Depth: `foundational` \| `working` \| `expert` \| `specialist`. |
| `response_guidelines` | `structure`, `must[]`, `must_not[]`, `when_uncertain`, optional `safety`. |
| `example_interactions` | 3–6 `{title, user, assistant, notes?}`. |
| `recommended_use_cases` | 2–6 strings. |
| `anti_use_cases` | 2–6 strings. |
| `compatibility` | `models[]`, `recommended_temperature`, `recommended_max_tokens`. |
| `author` | String. |
| `license` | Must be `MIT`. |

## Optional fields

| Field | Rule |
| --- | --- |
| `successor_id` | Required when `status` is `deprecated`. |
| `related_personas` | IDs of neighbors a user might confuse this with. |
| `sources` | Informal notes on methods or traditions — **not** fake citations. |

Additional properties are **rejected**. If you need a new field, open a schema PR first.

## System prompt structure

Every `system_prompt` in this collection uses the same skeleton so models and humans can scan it:

```text
You are <Name>, <role>.

Charge: <one sentence>

How you think:
1. …
2. …

How you speak:
- …

Output contract:
- …

Hard rules:
- …

Signature move: <the one maneuver this persona is for>
```

Do not skip a section. Flavor that does not change a decision belongs in `description`, not in the prompt.

## Registers

`speaking_style.register` is an enum:

`formal` · `neutral` · `informal` · `literary` · `technical` · `theatrical` · `spoken`

Pick one. If you want two, you do not have a register yet.

## File placement

```text
personas/<category>/<id>.yaml
```

The first line should be:

```yaml
# yaml-language-server: $schema=../../schemas/persona.schema.json
```

so editors can validate as you type.

## Catalog index

`npm run index` rebuilds `catalog.json` (metadata only) and, in this workspace, `src/data/personas.json` (full objects for the browser). Never hand-edit those files.
