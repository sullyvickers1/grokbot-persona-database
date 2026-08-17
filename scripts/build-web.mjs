#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const personas = JSON.parse(readFileSync(join(root, "web/personas.json"), "utf8"));
const ROLES = JSON.parse(readFileSync(join(root, "scripts/lib/roles.json"), "utf8"));

function roleOf(id, fallback) {
  if (!ROLES[id]) throw new Error(`missing role title for ${id}`);
  return ROLES[id] || fallback;
}
const web = join(root, "web");

const LABELS = {
  business: "Business",
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

function jsStr(s) {
  return JSON.stringify(String(s ?? ""));
}

function shell({ title, pathPrefix, nav, body }) {
  const css = pathPrefix + "styles.css";
  const icon = pathPrefix + "favicon.svg";
  const home = pathPrefix + "index.html";
  const guide = pathPrefix + "guide.html";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="Sixty system prompts for Grok and other chat models. Open a name, copy the prompt." />
    <meta name="theme-color" content="#10100f" />
    <link rel="icon" href="${icon}" type="image/svg+xml" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;1,400&family=Instrument+Serif&display=swap" />
    <link rel="stylesheet" href="${css}" />
  </head>
  <body>
    <header>
      <div class="wrap">
        <a class="brand" href="${home}">Grokbot<small>Persona catalog</small></a>
        <nav>
          <a href="${home}"${nav === "catalog" ? ' aria-current="page"' : ""}>Catalog</a>
          <a href="${pathPrefix}desk.html"${nav === "desk" ? ' aria-current="page"' : ""}>The desk</a>
          <a href="${guide}"${nav === "guide" ? ' aria-current="page"' : ""}>How to use</a>
        </nav>
      </div>
    </header>
    ${body}
    <footer>
      <div class="wrap">
        <p>MIT license. Not a substitute for a licensed professional.</p>
        <p><a href="https://github.com/sullyvickers1/grokbot-persona-database">Source</a></p>
      </div>
    </footer>
  </body>
</html>
`;
}

const chips = [
  `<button type="button" class="chip on" data-cat="all">All ${personas.length}</button>`,
  ...Object.entries(LABELS).map(
    ([k, label]) => `<button type="button" class="chip" data-cat="${k}">${label}</button>`,
  ),
].join("");

const cards = personas
  .slice()
  .sort((a, b) => roleOf(a.id).localeCompare(roleOf(b.id)))
  .map((p) => {
    const role = roleOf(p.id, p.name);
    const hay = [p.id, p.name, role, p.subcategory, p.short_description, p.description, ...(p.tags || [])]
      .join(" ")
      .toLowerCase();
    return `<article class="card" data-cat="${esc(p.category)}" data-hay="${esc(hay)}">
          <a href="p/${esc(p.id)}.html">
            <h2>${esc(role)}</h2>
            <p class="who-name">${esc(p.name)}</p>
          </a>
          <div class="card-actions">
            <button type="button" class="copy" data-copy="${esc(p.id)}">Copy prompt</button>
            <a class="open" href="p/${esc(p.id)}.html">Open</a>
          </div>
          <textarea hidden id="src-${esc(p.id)}">${esc(p.system_prompt)}</textarea>
        </article>`;
  })
  .join("\n        ");

const filterScript = `<script>
(function () {
  var q = document.getElementById("q");
  var chips = document.getElementById("chips");
  var cards = document.querySelectorAll(".card");
  var empty = document.getElementById("empty");
  var count = document.getElementById("count");
  var cat = "all";
  function paint() {
    var query = (q.value || "").trim().toLowerCase();
    var n = 0;
    for (var i = 0; i < cards.length; i++) {
      var el = cards[i];
      var okCat = cat === "all" || el.getAttribute("data-cat") === cat;
      var hay = el.getAttribute("data-hay") || "";
      var show = okCat && (!query || hay.indexOf(query) !== -1);
      el.hidden = !show;
      if (show) n++;
    }
    empty.hidden = n !== 0;
    count.textContent = n === cards.length ? cards.length + " personas" : n + " of " + cards.length;
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
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var id = btn.getAttribute("data-copy");
    var src = document.getElementById("src-" + id);
    if (!src) return;
    navigator.clipboard.writeText(src.value).then(function () {
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = "Copy prompt"; }, 1400);
    });
  });
})();
</script>`;

const indexBody = `<main class="wrap">
      <section class="hero">
        <h1>Copy a prompt. Staff a desk.</h1>
        <p class="lede">Seventy-six working voices. Sixteen of them are a company: sales, cash, hiring, support, delivery. Open a name. Copy the system prompt. Paste it into Grok. You do not install anything.</p>
      </section>
      <div class="toolbar">
        <input class="search" id="q" type="search" placeholder="Search cash, hiring, review, poem" />
        <div class="chips" id="chips">${chips}</div>
      </div>
      <p class="count" id="count">${personas.length} personas</p>
      <div class="grid" id="grid">
        ${cards}
      </div>
      <p class="empty" id="empty" hidden>No matches. Try a last name, or a word such as outage, poem, or meeting.</p>
    </main>
    ${filterScript}`;

writeFileSync(
  join(web, "index.html"),
  shell({ title: "Grokbot Personas", pathPrefix: "", nav: "catalog", body: indexBody }),
);

const guideBody = `<main class="wrap">
      <section class="hero">
        <h1>How to use a persona</h1>
        <p class="lede">This catalog is the product. You do not clone the repository. You do not run anything locally.</p>
      </section>
      <section class="section">
        <h2>In a chat</h2>
        <ul>
          <li>Find the persona whose job matches the work in front of you.</li>
          <li>Click Copy prompt.</li>
          <li>Paste it as the system message in Grok or any chat API.</li>
          <li>Send the logs, draft, or table you actually have.</li>
        </ul>
      </section>
      <section class="section">
        <h2>Limits</h2>
        <ul>
          <li>These are not a lawyer, doctor, or engineer of record.</li>
          <li>They are not celebrity impersonators.</li>
          <li>Do not combine two prompts.</li>
        </ul>
      </section>
    </main>`;

writeFileSync(
  join(web, "guide.html"),
  shell({ title: "How to use · Grokbot Personas", pathPrefix: "", nav: "guide", body: guideBody }),
);

mkdirSync(join(web, "p"), { recursive: true });

const copyPageScript = (id) => `<script>
function copyPrompt() {
  var el = document.getElementById("prompt");
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(function () {
    var btn = document.getElementById("copy-prompt");
    btn.textContent = "Copied";
    setTimeout(function () { btn.textContent = "Copy system prompt"; }, 1400);
  });
}
function copyId() {
  navigator.clipboard.writeText(${jsStr(id)});
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
      (ex) =>
        `<article class="ex"><h3>${esc(ex.title)}</h3><p class="who">You</p><p>${esc(ex.user)}</p><p class="who">Them</p><p>${esc(ex.assistant)}</p></article>`,
    )
    .join("");
  const relatedHtml = related.length
    ? `<section class="section"><h2>Related</h2><ul>${related
        .map((r) => `<li><a href="${esc(r.id)}.html">${esc(r.name)}</a>. ${esc(r.short_description)}</li>`)
        .join("")}</ul></section>`
    : "";
  const temp = persona.compatibility?.recommended_temperature ?? "";
  const notes = persona.compatibility?.notes ? ". " + esc(persona.compatibility.notes) : "";

  const body = `<main class="wrap">
      <a class="back" href="../index.html">Catalog</a>
      <p class="kicker">${esc(persona.name)} / ${esc(LABELS[persona.category] || persona.category)}</p>
      <h1 class="name">${esc(roleOf(persona.id, persona.name))}</h1>
      <p class="desc">${esc(persona.description)}</p>
      <div class="actions">
        <button class="btn" type="button" id="copy-prompt" onclick="copyPrompt()">Copy system prompt</button>
        <button class="btn ghost" type="button" onclick="copyId()">Copy ID</button>
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
    ${copyPageScript(persona.id)}`;

  writeFileSync(
    join(web, "p", `${persona.id}.html`),
    shell({
      title: `${persona.name} · Grokbot Personas`,
      pathPrefix: "../",
      nav: "catalog",
      body,
    }),
  );
}

const deskPeople = personas.filter((p) => p.category === "business");
const deskRows = deskPeople
  .slice()
  .sort((a, b) => roleOf(a.id).localeCompare(roleOf(b.id)))
  .map(
    (p) =>
      `<article class="card">
          <a href="p/${esc(p.id)}.html">
            <h2>${esc(roleOf(p.id, p.name))}</h2>
            <p class="who-name">${esc(p.name)}</p>
          </a>
          <div class="card-actions">
            <button type="button" class="copy" data-copy="${esc(p.id)}">Copy prompt</button>
            <a class="open" href="p/${esc(p.id)}.html">Open</a>
          </div>
          <textarea hidden id="src-${esc(p.id)}">${esc(p.system_prompt)}</textarea>
        </article>`,
  )
  .join("\n        ");

const deskBody = `<main class="wrap">
      <section class="hero">
        <h1>The desk</h1>
        <p class="lede">Sixteen operators. One company. Do not paste all sixteen into one chat. Open Tess Rowan first. She will send you to the next seat.</p>
      </section>
      <section class="section">
        <h2>How to run them</h2>
        <ul>
          <li>One prompt at a time. Tess routes. The specialist writes the artifact.</li>
          <li>Sales week: Tess, then Boone, then Nyla, then Jude.</li>
          <li>Money week: Lev, then Pax, then Enid.</li>
          <li>Hiring week: Lev (can you pay), then Yara, then Rook for the drill.</li>
          <li>Queue week: Noor, then Sable, then Oren, then Kit if the paste is daily.</li>
        </ul>
      </section>
      <div class="grid" style="margin-top:2rem">
        ${deskRows}
      </div>
    </main>
    <script>
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy]");
      if (!btn) return;
      var id = btn.getAttribute("data-copy");
      var src = document.getElementById("src-" + id);
      if (!src) return;
      navigator.clipboard.writeText(src.value).then(function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy prompt"; }, 1400);
      });
    });
    </script>`;

writeFileSync(
  join(web, "desk.html"),
  shell({ title: "The desk · Grokbot Personas", pathPrefix: "", nav: "desk", body: deskBody }),
);

writeFileSync(join(web, "404.html"), readFileSync(join(web, "index.html")));
console.log(`Wrote static catalog: index + desk + ${personas.length} persona pages`);

