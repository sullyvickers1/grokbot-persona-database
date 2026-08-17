#!/usr/bin/env node
/**
 * Load a persona YAML by id and build a chat-completions messages array.
 *
 *   node examples/load-persona.mjs ada-vale "The p99 doubled after retries."
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function findPersonaPath(id) {
  const categories = [
    "professional",
    "creative",
    "personality",
    "specialized",
    "experimental",
    "business",
  ];
  for (const category of categories) {
    const path = join(root, "personas", category, `${id}.yaml`);
    try {
      readFileSync(path);
      return path;
    } catch {
      /* try next */
    }
  }
  const known = categories.flatMap((category) =>
    readdirSync(join(root, "personas", category))
      .filter((n) => n.endsWith(".yaml"))
      .map((n) => n.replace(/\.yaml$/, "")),
  );
  throw new Error(`Unknown persona "${id}". Known: ${known.join(", ")}`);
}

export function loadPersona(id) {
  return parse(readFileSync(findPersonaPath(id), "utf8"));
}

export function toMessages(persona, userText, options = {}) {
  const messages = [{ role: "system", content: persona.system_prompt }];
  if (options.withExamples) {
    const n = Number(options.withExamples) || 1;
    for (const ex of persona.example_interactions.slice(0, n)) {
      messages.push({ role: "user", content: ex.user });
      messages.push({ role: "assistant", content: ex.assistant });
    }
  }
  messages.push({ role: "user", content: userText });
  return messages;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const id = process.argv[2];
  const prompt = process.argv.slice(3).join(" ") || "Introduce yourself in four sentences.";
  if (!id) {
    console.error("usage: node examples/load-persona.mjs <id> [user prompt]");
    process.exit(2);
  }
  const persona = loadPersona(id);
  const messages = toMessages(persona, prompt);
  console.log(JSON.stringify({ id: persona.id, name: persona.name, messages }, null, 2));
}
