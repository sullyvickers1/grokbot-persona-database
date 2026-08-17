#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const personas = JSON.parse(readFileSync(join(root, "web/personas.json"), "utf8"));
const web = join(root, "web");

const LABELS = {
  professional: "Professional",
  creative: "Creative",
  personality: "Personality",
  specialized: "Specialized",
  experimental: "Experimental",
};

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function page({ title, body, extraHead = "" }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="Sixty system prompts for Grok and other models. Copy one and send the real draft." />
    <meta name="theme-color" content="#121110" />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Serif&display=swap" />
    <link rel="stylesheet" href="styles.css" />
    ${extraHead}
  </head>
  <body>
    <header>
      <div class="wrap">
        <a class="brand" href="index.html">Grokbot<span>Personas</span></a>
        <nav>
          <a href="index.html">Catalog</a>
          <a href="guide.html">Guide</a>
        </nav>
      </div>
    </header>
    ${body}
    <footer>
      <div class="wrap">
        <p>MIT license. Not a substitute for a licensed professional.</p>
        <p>Sully Vickers</p>
      </div>
    </footer>
  </body>
</html>
`;
}

const chips = [
  `<button type="button" class="chip on" data-cat="all">All ${personas.length}</button>`,
  ...Object.entries(LABELS).map(
    ([k, label]) =>
      `<button type="button" class="chip" data-cat="${k}">${label}</button>`,
  ),
].join("");

const cards = personas
  .map((p) => {
    const hay = [p.id, p.name, p.subcategory, p.short_description, p.description, ...(p.tags || [])]
      .join(" ")
      .toLowerCase();
    return `<a class="card" href="p/${esc(p.id)}.html" data-cat="${esc(p.category)}" data-hay="${esc(hay)}">
          <span class="cat">${esc(LABELS[p.category] || p.category)}</span>
          <h2>${esc(p.name)}</h2>
          <p>${esc(p.short_description)}</p>
        </a>`;
  })
  .join("\n        ");

const filterScript = `<script>
(function () {
  var q = document.getElementById("q");
  var chips = document.getElementById("chips");
  var cards = document.querySelectorAll(".card");
  var empty = document.getElementById("empty");
  var cat = "all";
  function paint() {
    var query = (q.value || "").trim().toLowerCase();
    var n = 0;
    for (var i = 0; i < cards.length; i++) {
      var el = cards[i];
      var okCat = cat === "all" || el.getAttribute("data-cat") === cat;
      var hay = el.getAttribute("data-hay") || "";
      var okQ = !query || hay.indexOf(query) !== -1;
      var show = okCat && okQ;
      el.hidden = !show;
      if (show) n++;
    }
    empty.hidden = n !== 0;
    var buttons = chips.querySelectorAll("[data-cat]");
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].className = buttons[j].getAttribute("data-cat") === cat ? "chip on" : "chip";
    }
  }
  q.addEventListener("input", paint);
  chips.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cat]");
    if (!btn) return;
    cat = btn.getAttribute("data-cat");
    paint();
  });
})();
</script>`;

const indexBody = `<main class="wrap">
      <h1>System prompts with a job</h1>
      <p class="lede">Ada Vale for an outage. Hollis for a bloated email. The Midwife when the other person should do the thinking. Open a card and copy the prompt. You do not need to clone anything.</p>
      <input class="search" id="q" type="search" placeholder="Search by name, job, or tag" />
      <div class="chips" id="chips">${chips}</div>
      <div class="grid" id="grid">
        ${cards}
      </div>
      <p class="empty" id="empty" hidden>No matches. Try a last name, or a word such as outage, poem, or meeting.</p>
    </main>
    ${filterScript}`;

writeFileSync(
  join(web, "index.html"),
  page({ title: "Grokbot Personas", body: indexBody }),
);

const guideBody = `<main class="wrap" style="max-width:40rem">
      <h1>How to use a persona</h1>
      <p class="lede">Pick the persona whose job matches the work in front of you. Do not combine two prompts. Do not choose by how interesting the name sounds.</p>
      <section class="section">
        <h2>In a chat</h2>
        <ul>
          <li>Copy the system prompt.</li>
          <li>Paste it as the system message.</li>
          <li>Start from the temperature listed on the persona page.</li>
          <li>Send the logs, draft, or table you actually have.</li>
        </ul>
      </section>
      <section class="section">
        <h2>Limits</h2>
        <ul>
          <li>These are not a lawyer, doctor, or engineer of record.</li>
          <li>They are not celebrity or copyrighted-character impersonators.</li>
          <li>They are not one-line costume prompts.</li>
        </ul>
      </section>
    </main>`;

writeFileSync(join(web, "guide.html"), page({ title: "Guide · Grokbot Personas", body: guideBody }));

mkdirSync(join(web, "p"), { recursive: true });

const copyScript = `<script>
function copyPrompt() {
  var el = document.getElementById("prompt");
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(function () {
    var btn = document.getElementById("copy-prompt");
    btn.textContent = "Copied";
    setTimeout(function () { btn.textContent = "Copy system prompt"; }, 1400);
  });
}
function copyId(id) {
  navigator.clipboard.writeText(id);
}
</script>`;

for (const persona of personas) {
  const related = (persona.related_personas || [])
    .map((id) => personas.find((p) => p.id === id))
    .filter(Boolean);
  const uses = (persona.recommended_use_cases || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const avoid = (persona.anti_use_cases || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const examples = (persona.example_interactions || [])
    .map(
      (ex) => `<article class="ex"><h3>${esc(ex.title)}</h3><p class="who">You</p><p>${esc(ex.user)}</p><p class="who">Them</p><p>${esc(ex.assistant)}</p></article>`,
    )
    .join("");
  const relatedHtml = related.length
    ? `<section class="section"><h2>Related</h2><ul>${related
        .map(
          (r) =>
            `<li><a href="${esc(r.id)}.html"><span>${esc(r.name)}</span></a>. ${esc(r.short_description)}</li>`,
        )
        .join("")}</ul></section>`
    : "";
  const temp = persona.compatibility?.recommended_temperature ?? "";
  const notes = persona.compatibility?.notes ? ". " + esc(persona.compatibility.notes) : "";

  const body = `<main class="wrap" style="max-width:48rem">
      <a class="back" href="../index.html">Catalog</a>
      <p class="kicker">${esc(LABELS[persona.category] || persona.category)} / ${esc(persona.subcategory)}</p>
      <h1 class="name">${esc(persona.name)}</h1>
      <p class="desc">${esc(persona.description)}</p>
      <div class="actions">
        <button class="btn" type="button" id="copy-prompt" onclick="copyPrompt()">Copy system prompt</button>
        <button class="btn ghost" type="button" onclick="copyId('${esc(persona.id)}')">Copy ID</button>
      </div>
      <p class="temp">Temperature ${esc(temp)}${notes}</p>
      <section class="section">
        <h2>When to use</h2>
        <ul>${uses}</ul>
        <h2 style="margin-top:1.5rem">When not to</h2>
        <ul>${avoid}</ul>
      </section>
      <section class="section">
        <h2>System prompt</h2>
        <pre id="prompt">${esc(persona.system_prompt)}</pre>
      </section>
      <section class="section">
        <h2>Examples</h2>
        ${examples}
      </section>
      ${relatedHtml}
      <p class="temp">${esc(persona.id)} · ${esc(persona.version)} · ${esc(persona.license)}</p>
    </main>
    ${copyScript}`;

  const html = page({
    title: `${persona.name} · Grokbot Personas`,
    body,
    extraHead: `<link rel="stylesheet" href="../styles.css" />
    <link rel="icon" href="../favicon.svg" type="image/svg+xml" />`,
  }).replace(
    '<link rel="stylesheet" href="styles.css" />',
    '<link rel="stylesheet" href="../styles.css" />',
  ).replace(
    '<link rel="icon" href="favicon.svg" type="image/svg+xml" />',
    '<link rel="icon" href="../favicon.svg" type="image/svg+xml" />',
  ).replace(
    '<a class="brand" href="index.html">',
    '<a class="brand" href="../index.html">',
  ).replace(
    '<a href="index.html">Catalog</a>',
    '<a href="../index.html">Catalog</a>',
  ).replace(
    '<a href="guide.html">Guide</a>',
    '<a href="../guide.html">Guide</a>',
  );

  writeFileSync(join(web, "p", `${persona.id}.html`), html);
}

console.log(`Wrote static catalog: index + ${personas.length} persona pages`);
