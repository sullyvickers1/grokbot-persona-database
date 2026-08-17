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
];

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

const files = walk();
const ids = new Set();
const errors = [];
const relatedMissing = [];

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
  if ((data.system_prompt ?? "").length < 1200) {
    errors.push(`${rel}: system_prompt too short (${(data.system_prompt ?? "").length})`);
  }
  if (!validate(data)) {
    for (const err of validate.errors ?? []) {
      errors.push(`${rel}: ${err.instancePath || "/"} ${err.message}`);
    }
  }
  file.data = data;
}

for (const file of files) {
  for (const other of file.data?.related_personas ?? []) {
    if (!ids.has(other)) relatedMissing.push(`${file.name}: unknown related persona "${other}"`);
  }
}

const expected = {
  professional: 20,
  creative: 12,
  personality: 14,
  specialized: 10,
  experimental: 4,
};
for (const [category, count] of Object.entries(expected)) {
  const n = files.filter((f) => f.category === category).length;
  if (n !== count) errors.push(`${category}: expected ${count} files, found ${n}`);
}
if (files.length !== 60) errors.push(`expected 60 persona files, found ${files.length}`);

if (errors.length) {
  console.error(`FAILED — ${errors.length} error(s)\n`);
  for (const line of errors) console.error(" -", line);
  process.exit(1);
}

if (relatedMissing.length) {
  console.warn("Warnings (related_personas not in catalog):");
  for (const line of relatedMissing) console.warn(" -", line);
}

console.log(`OK — ${files.length} personas valid against schema ${schema.$comment ?? ""}`.trim());
