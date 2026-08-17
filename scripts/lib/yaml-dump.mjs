/** Minimal YAML emitter for persona objects. Keeps long text as literal blocks. */

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function needsQuotes(value) {
  if (value === "") return true;
  return (
    /[:#{}[\],&*!|>'"%@`]|^(?:true|false|null|yes|no|on|off)$/i.test(value) ||
    /^\d/.test(value) ||
    value.includes("\n")
  );
}

function emitScalar(value) {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";
  const text = String(value);
  if (text.includes("\n") || text.length > 88) return null;
  return needsQuotes(text) ? JSON.stringify(text) : text;
}

function emitBlock(value, indent) {
  const pad = " ".repeat(indent);
  const lines = String(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\s+$/, "")
    .split("\n");
  return ["|-", ...lines.map((line) => (line.length ? pad + line : ""))].join("\n");
}

export function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (isPlainObject(item) || Array.isArray(item)) {
          const body = toYaml(item, indent + 2);
          const lines = body.split("\n");
          return `${pad}- ${lines[0].trimStart()}\n${lines.slice(1).join("\n")}`;
        }
        const scalar = emitScalar(item);
        if (scalar === null) {
          const block = emitBlock(item, indent + 4);
          return `${pad}- ${block}`;
        }
        return `${pad}- ${scalar}`;
      })
      .join("\n");
  }
  if (isPlainObject(value)) {
    return Object.keys(value)
      .map((key) => {
        const child = value[key];
        if (child === undefined) return null;
        if (isPlainObject(child) || Array.isArray(child)) {
          if (Array.isArray(child) && child.length === 0) return `${pad}${key}: []`;
          if (isPlainObject(child) && Object.keys(child).length === 0) {
            return `${pad}${key}: {}`;
          }
          return `${pad}${key}:\n${toYaml(child, indent + 2)}`;
        }
        const scalar = emitScalar(child);
        if (scalar === null) return `${pad}${key}: ${emitBlock(child, indent + 2)}`;
        return `${pad}${key}: ${scalar}`;
      })
      .filter(Boolean)
      .join("\n");
  }
  const scalar = emitScalar(value);
  return scalar === null ? emitBlock(value, indent) : scalar;
}

export function dumpPersona(persona) {
  return `# yaml-language-server: $schema=../../schemas/persona.schema.json\n${toYaml(persona)}\n`;
}
