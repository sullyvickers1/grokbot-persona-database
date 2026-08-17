#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const categories = [
  "professional",
  "creative",
  "personality",
  "specialized",
  "experimental",
];

const personas = [];
for (const category of categories) {
  const dir = join(root, "personas", category);
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".yaml")) continue;
    const data = parse(readFileSync(join(dir, name), "utf8"));
    personas.push({
      id: data.id,
      name: data.name,
      category: data.category,
      subcategory: data.subcategory,
      tags: data.tags,
      short_description: String(data.short_description ?? "").trim(),
      path: `personas/${category}/${name}`,
      version: data.version,
      status: data.status,
    });
  }
}

personas.sort((a, b) => a.id.localeCompare(b.id));
const counts = Object.fromEntries(
  categories.map((c) => [c, personas.filter((p) => p.category === c).length]),
);

const catalog = {
  generated_at: new Date().toISOString(),
  schema_version: "1.1.0",
  count: personas.length,
  categories: counts,
  personas,
};

writeFileSync(join(root, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");

const full = [];
for (const category of categories) {
  const dir = join(root, "personas", category);
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".yaml")) continue;
    full.push(parse(readFileSync(join(dir, name), "utf8")));
  }
}
full.sort((a, b) => a.id.localeCompare(b.id));
const fullJson = JSON.stringify(full, null, 2) + "\n";

mkdirSync(join(root, "web"), { recursive: true });
writeFileSync(join(root, "web/personas.json"), fullJson);

const built = spawnSync(process.execPath, [join(root, "scripts/build-web.mjs")], {
  stdio: "inherit",
});
if (built.status !== 0) process.exit(built.status ?? 1);

if (existsSync(join(root, "src"))) {
  mkdirSync(join(root, "src/data"), { recursive: true });
  writeFileSync(join(root, "src/data/personas.json"), fullJson);
  console.log(`Indexed ${personas.length} personas → catalog.json, web/personas.json, src/data/personas.json`);
} else {
  console.log(`Indexed ${personas.length} personas → catalog.json, web/personas.json`);
}
