# Persona format

Source of truth: [`schemas/persona.schema.json`](../schemas/persona.schema.json) (v1.1.0).

Personas are YAML so a human can edit a long `system_prompt` without drowning in escaped quotes. JSON is accepted by the schema if you convert; the collection itself ships YAML.

Field order in shipped files is human-first: identity, then the prompt, then the contract metadata, then bookkeeping (`version`, `status`, `schema_version`, `author`, `license`). `successor_id` and `sources` are omitted when empty.

## Required fields

| Field | Rule |
| --- | --- |
| `id` | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 3–64 chars. Immutable after publish. |
| `name` | Display name the model should use for itself. |
| `slug` | Must equal `id`. Exists so catalogs can treat it as a URL key. |
| `category` | `professional` \| `creative` \| `personality` \| `specialized` \| `experimental`. Must match the folder. |
| `subcategory` | Short label inside the category (`systems`, `voice`, `law`). |
| `tags` | 3–12 unique kebab-case tags. |
| `short_description` | 40–160 characters. Catalog blurb. No marketing adjectives. Trimmed. |
| `description` | 160–900 characters. What it is for and when to pick it over a neighbor. |
| `system_prompt` | 720–12,000 characters. See structure below. |
| `personality_traits` | 4–8 objects: `trait`, `intensity` (1–5), `notes`. At most two traits may be `5`. |
| `speaking_style` | `tone`, `register`, `sentence_shape`, `vocabulary`, `humor`, `do[]`, `dont[]`. |
| `knowledge_domains` | 3–8 `{domain, depth, notes?}`. Depth: `foundational` \| `working` \| `expert` \| `specialist`. |
| `response_guidelines` | `structure`, `must[]`, `must_not[]`, `when_uncertain`, optional `safety`. |
| `example_interactions` | 3–6 `{title, user, assistant, notes?}`. |
| `recommended_use_cases` | 2–6 strings. |
| `anti_use_cases` | 2–6 strings. |
| `compatibility` | `models[]`, `recommended_temperature`, `recommended_max_tokens`, optional `notes`. |
| `version` | Semver of **this file**. |
| `last_updated` | `YYYY-MM-DD`. |
| `status` | `draft` \| `stable` \| `deprecated`. |
| `schema_version` | Must be `"1.1.0"`. |
| `author` | String. |
| `license` | Must be `MIT`. |

## Optional fields

| Field | Rule |
| --- | --- |
| `successor_id` | Required when `status` is `deprecated`. Omit otherwise. |
| `related_personas` | IDs of neighbors a user might confuse this with. |
| `sources` | Informal notes on methods or traditions — **not** fake citations. Omit when empty. |
| `compatibility.notes` | One sentence that could only belong to this persona. |

Additional properties are **rejected**. If you need a new field, open a schema PR first.

## System prompt structure

Default skeleton, so models and humans can scan it:

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

This is the default, not a law. A flagship voice may drop the headings if the same jobs are still done — Hollis does not number his thoughts; Grit does not file an output contract; Night Frequency does not sound like a grant writer. Flavor that does not change a decision belongs in `description`, not in the prompt.

## Registers

`speaking_style.register` is an enum:

`formal` · `neutral` · `informal` · `literary` · `technical` · `theatrical` · `spoken`

Pick one. If you want two, you do not have a register yet.

## File placement

`personas/<category>/<id>.yaml`
