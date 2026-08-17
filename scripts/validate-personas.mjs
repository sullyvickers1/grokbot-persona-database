#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import Ajv2020 from "ajv/dist/2020.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(
  readFileSync(join(root, "schemas/persona.schema.json"), "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const categories = [
  "professional",
  "creative",
  "personality",
  "specialized",
  "experimental",
  "business",
];

const TITLE_PREFIXES = new Set(["the", "ms.", "ms", "orion-7"]);

function walk() {
  const files = [];
  for (const category of categories) {
    const dir = join(root, "personas", category);
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith(".yaml")) continue;
      files.push({ category, name, path: join(dir, name) });
    }
  }
  return files;
}

function tokens(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3),
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter += 1;
  return inter / (a.size + b.size - inter);
}

function givenName(name) {
  const first = name.trim().split(/\s+/)[0].toLowerCase();
  return first;
}

function surname(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return null;
  if (TITLE_PREFIXES.has(parts[0].toLowerCase())) return null;
  return parts[parts.length - 1].toLowerCase();
}

function signatureMove(prompt) {
  const match = String(prompt).match(/Signature move:\s*([^\n]+)/i);
  return match ? match[1].trim().toLowerCase() : "";
}

const files = walk();
const ids = new Set();
const errors = [];
const warnings = [];
const relatedMissing = [];
const given = new Map();
const family = new Map();
const noteCounts = new Map();

for (const file of files) {
  const raw = readFileSync(file.path, "utf8");
  let data;
  try {
    data = parse(raw);
  } catch (err) {
    errors.push(`${file.name}: YAML parse error: ${err.message}`);
    continue;
  }
  const rel = relative(root, file.path);
  if (data.id !== file.name.replace(/\.yaml$/, "")) {
    errors.push(`${rel}: filename must be {id}.yaml (id=${data.id})`);
  }
  if (data.category !== file.category) {
    errors.push(`${rel}: category field "${data.category}" != folder "${file.category}"`);
  }
  if (data.slug !== data.id) {
    errors.push(`${rel}: slug must equal id`);
  }
  if (ids.has(data.id)) errors.push(`${rel}: duplicate id ${data.id}`);
  ids.add(data.id);
  const fives = (data.personality_traits ?? []).filter((t) => t.intensity === 5);
  if (fives.length > 2) {
    errors.push(`${rel}: at most two traits may be intensity 5`);
  }
  if ((data.system_prompt ?? "").length < 720) {
    errors.push(`${rel}: system_prompt too short (${(data.system_prompt ?? "").length})`);
  }
  if (typeof data.short_description === "string" && data.short_description !== data.short_description.trim()) {
    errors.push(`${rel}: short_description has leading/trailing whitespace`);
  }
  if (data.successor_id == null && raw.includes("successor_id:")) {
    warnings.push(`${rel}: successor_id should be omitted unless the persona is deprecated`);
  }

  const g = givenName(data.name);
  if (!TITLE_PREFIXES.has(g)) {
    if (!given.has(g)) given.set(g, []);
    given.get(g).push(data.id);
  }
  const s = surname(data.name);
  if (s) {
    if (!family.has(s)) family.set(s, []);
    family.get(s).push(data.id);
  }

  const note = data.compatibility?.notes;
  if (note) {
    if (!noteCounts.has(note)) noteCounts.set(note, []);
    noteCounts.get(note).push(data.id);
  }

  if (!validate(data)) {
    for (const err of validate.errors ?? []) {
      errors.push(`${rel}: ${err.instancePath || "/"} ${err.message}`);
    }
  }
  file.data = data;
}

for (const [name, holders] of given) {
  if (holders.length > 1) {
    errors.push(`given name "${name}" reused: ${holders.join(", ")}`);
  }
}
for (const [name, holders] of family) {
  if (holders.length > 1) {
    errors.push(`surname "${name}" reused: ${holders.join(", ")}`);
  }
}
for (const [note, holders] of noteCounts) {
  if (holders.length > 2) {
    errors.push(`compatibility.notes reused ${holders.length} times: "${note.slice(0, 72)}…"`);
  }
}

const byId = new Map(files.filter((f) => f.data).map((f) => [f.data.id, f.data]));
for (const file of files) {
  const data = file.data;
  if (!data) continue;
  for (const other of data.related_personas ?? []) {
    if (!ids.has(other)) {
      relatedMissing.push(`${file.name}: unknown related persona "${other}"`);
      continue;
    }
    const mine = tokens((data.example_interactions ?? []).map((e) => e.assistant).join(" "));
    const theirs = tokens(
      (byId.get(other)?.example_interactions ?? []).map((e) => e.assistant).join(" "),
    );
    const score = jaccard(mine, theirs);
    if (score >= 0.42) {
      errors.push(
        `${data.id} ↔ ${other}: example replies overlap too much (jaccard ${score.toFixed(2)})`,
      );
    }
    const a = signatureMove(data.system_prompt);
    const b = signatureMove(byId.get(other)?.system_prompt ?? "");
    if (a && b && a === b) {
      errors.push(`${data.id} ↔ ${other}: identical signature move`);
    }
  }
}

const expected = {
  professional: 20,
  creative: 12,
  personality: 14,
  specialized: 10,
  experimental: 4,
  business: 16,
};
for (const [category, count] of Object.entries(expected)) {
  const n = files.filter((f) => f.category === category).length;
  if (n !== count) errors.push(`${category}: expected ${count} files, found ${n}`);
}
if (files.length !== 76) errors.push(`expected 76 persona files, found ${files.length}`);

if (relatedMissing.length) {
  for (const line of relatedMissing) errors.push(line);
}

if (errors.length) {
  console.error(`FAILED — ${errors.length} error(s)\n`);
  for (const line of errors) console.error(" -", line);
  process.exit(1);
}

if (warnings.length) {
  console.warn("Warnings:");
  for (const line of warnings) console.warn(" -", line);
}

console.log(`OK — ${files.length} personas valid (schema, names, neighbor overlap).`);
