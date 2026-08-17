# Versioning

Two clocks.

## Collection

The repository tag (`v1.0.0`, …) describes the set: count, schema version, and tooling.

| Collection MAJOR | Schema break, category rename, or ID policy change |
| Collection MINOR | New personas, new optional schema fields, new loaders |
| Collection PATCH | Copy, docs, validation tightening that rejects already-invalid files |

## Persona

Each file has its own `version`.

| Persona MAJOR | Different job, different refusals, different output shape |
| Persona MINOR | New domain, stronger contract, additional example that teaches a new move |
| Persona PATCH | Typos, tighter wording, equivalent examples |

**IDs never rename.** To replace a persona:

1. Add the successor with a new ID.
2. Set the old file to `status: deprecated` and `successor_id: <new-id>`.
3. Bump the old file’s PATCH or MINOR — the behavior of a deprecated file should stay frozen.

## Schema

`schema_version` on every persona must match the current schema const (`1.1.0`). A schema MAJOR is a collection MAJOR. Draft personas may target a branch; `stable` personas must validate on `main`.
