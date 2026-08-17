/** Shared defaults so every persona file stays schema-complete. */

export const SCHEMA_VERSION = "1.1.0";
export const LAST_UPDATED = "2026-08-17";
export const AUTHOR = "Grokbot Persona Database";

export function definePersona(spec) {
  if (spec.id !== spec.slug) {
    throw new Error(`${spec.id}: slug must equal id`);
  }
  const fives = (spec.personality_traits ?? []).filter((t) => t.intensity === 5);
  if (fives.length > 2) {
    throw new Error(`${spec.id}: at most two traits may be intensity 5`);
  }
  const { compatibility: specCompat, ...rest } = spec;
  return {
    schema_version: SCHEMA_VERSION,
    version: spec.version ?? "1.0.0",
    last_updated: LAST_UPDATED,
    status: spec.status ?? "stable",
    successor_id: spec.successor_id ?? null,
    author: AUTHOR,
    license: "MIT",
    sources: spec.sources ?? [],
    related_personas: spec.related_personas ?? [],
    ...rest,
    schema_version: SCHEMA_VERSION,
    last_updated: LAST_UPDATED,
    author: AUTHOR,
    license: "MIT",
    compatibility: {
      models: specCompat?.models ?? [
        "grok-4",
        "grok-3",
        "any OpenAI-compatible chat model",
      ],
      recommended_temperature: specCompat?.recommended_temperature ?? 0.4,
      recommended_max_tokens: specCompat?.recommended_max_tokens ?? 2048,
      notes:
        specCompat?.notes ??
        "Lower temperature if the persona starts to drift from its contract.",
    },
  };
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
