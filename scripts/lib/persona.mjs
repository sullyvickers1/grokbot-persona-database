/** Shared defaults so every persona file stays schema-complete. */

import { COMPAT_NOTES } from "./compat-notes.mjs";

export const SCHEMA_VERSION = "1.1.0";
export const LAST_UPDATED = "2026-08-17";
export const AUTHOR = "Grokbot Persona Database";

/** Human-first key order. Identity before bookkeeping. */
export const PERSONA_KEY_ORDER = [
  "id",
  "slug",
  "name",
  "category",
  "subcategory",
  "tags",
  "short_description",
  "description",
  "system_prompt",
  "personality_traits",
  "speaking_style",
  "knowledge_domains",
  "response_guidelines",
  "example_interactions",
  "recommended_use_cases",
  "anti_use_cases",
  "related_personas",
  "compatibility",
  "version",
  "last_updated",
  "status",
  "successor_id",
  "schema_version",
  "author",
  "license",
  "sources",
];

/**
 * Per-persona temperature notes. A shared default made the whole
 * collection sound compiled. If a spec omits notes, we look up a
 * unique line; we never invent a generic one.
 */
export function definePersona(spec) {
  if (spec.id !== spec.slug) {
    throw new Error(`${spec.id}: slug must equal id`);
  }
  const fives = (spec.personality_traits ?? []).filter((t) => t.intensity === 5);
  if (fives.length > 2) {
    throw new Error(`${spec.id}: at most two traits may be intensity 5`);
  }

  const { compatibility: specCompat, sources, successor_id, ...rest } = spec;

  const compatibility = {
    models: specCompat?.models ?? [
      "grok-4",
      "grok-3",
      "any OpenAI-compatible chat model",
    ],
    recommended_temperature: specCompat?.recommended_temperature ?? 0.4,
    recommended_max_tokens: specCompat?.recommended_max_tokens ?? 2048,
  };
  if (specCompat?.notes) {
    compatibility.notes = specCompat.notes;
  } else if (COMPAT_NOTES[spec.id]) {
    compatibility.notes = COMPAT_NOTES[spec.id];
  }

  const persona = {
    ...rest,
    short_description: String(spec.short_description ?? "").trim(),
    description: String(spec.description ?? "").trim(),
    compatibility,
    version: spec.version ?? "1.0.0",
    last_updated: spec.last_updated ?? LAST_UPDATED,
    status: spec.status ?? "stable",
    schema_version: SCHEMA_VERSION,
    author: spec.author ?? AUTHOR,
    license: "MIT",
  };

  if (successor_id) persona.successor_id = successor_id;
  if (Array.isArray(sources) && sources.length > 0) persona.sources = sources;
  if (!persona.related_personas) persona.related_personas = [];

  return orderPersona(persona);
}

export function orderPersona(persona) {
  const ordered = {};
  for (const key of PERSONA_KEY_ORDER) {
    if (persona[key] !== undefined) ordered[key] = persona[key];
  }
  for (const key of Object.keys(persona)) {
    if (!(key in ordered)) ordered[key] = persona[key];
  }
  return ordered;
}

export function assertCategory(personas, category, expected) {
  if (personas.length !== expected) {
    throw new Error(`${category}: expected ${expected} personas, got ${personas.length}`);
  }
  for (const p of personas) {
    if (p.category !== category) {
      throw new Error(`${p.id}: category ${p.category} != ${category}`);
    }
  }
}
