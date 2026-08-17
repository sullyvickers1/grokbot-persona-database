#!/usr/bin/env node
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dumpPersona } from "./lib/yaml-dump.mjs";
import { professional } from "./data/professional.mjs";
import { professionalB } from "./data/professional-b.mjs";
import { creative } from "./data/creative.mjs";
import { personality } from "./data/personality.mjs";
import { specialized } from "./data/specialized.mjs";
import { experimental } from "./data/experimental.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const all = [
  ...professional,
  ...professionalB,
  ...creative,
  ...personality,
  ...specialized,
  ...experimental,
];

const expected = {
  professional: 20,
  creative: 12,
  personality: 14,
  specialized: 10,
  experimental: 4,
};

for (const [category, count] of Object.entries(expected)) {
  const n = all.filter((p) => p.category === category).length;
  if (n !== count) {
    throw new Error(`${category}: expected ${count}, got ${n}`);
  }
}

if (all.length !== 60) {
  throw new Error(`expected 60 personas, got ${all.length}`);
}

const keep = new Map();
const ids = new Set();
for (const persona of all) {
  if (ids.has(persona.id)) throw new Error(`duplicate id: ${persona.id}`);
  ids.add(persona.id);
  if (persona.slug !== persona.id) throw new Error(`${persona.id}: slug mismatch`);
  const dest = join(root, "personas", persona.category, `${persona.id}.yaml`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, dumpPersona(persona), "utf8");
  keep.set(dest, true);
}

let removed = 0;
for (const category of Object.keys(expected)) {
  const dir = join(root, "personas", category);
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".yaml")) continue;
    const path = join(dir, name);
    if (!keep.has(path)) {
      unlinkSync(path);
      removed += 1;
    }
  }
}

console.log(`Wrote ${all.length} personas${removed ? `, removed ${removed} stale file(s)` : ""}.`);
