const LABELS = {
  professional: "Professional",
  creative: "Creative",
  personality: "Personality",
  specialized: "Specialized",
  experimental: "Experimental",
};

const CATEGORIES = Object.keys(LABELS);

const $app = document.getElementById("app");
let personas = [];

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """);
}

function route() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "guide") return renderGuide();
  if (parts[0] === "persona" && parts[1]) return renderPersona(parts[1]);
  return renderCatalog();
}

function setNav(id) {
  for (const el of document.querySelectorAll("nav a")) el.classList.remove("active");
  document.getElementById(id)?.classList.add("active");
}

function searchList(query, category) {
  const q = query.trim().toLowerCase();
  return personas.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (!q) return true;
    const hay = [p.id, p.name, p.subcategory, p.short_description, p.description, ...(p.tags || [])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function renderCatalog() {
  setNav("nav-catalog");
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const q0 = params.get("q") || "";
  const cat0 = params.get("cat") || "all";

  $app.innerHTML = `
    <main class="wrap">
      <h1>System prompts with a job</h1>
      <p class="lede">
        Ada Vale for an outage. Hollis for a bloated email. The Midwife when
        the other person should do the thinking. Open a card and copy the
        prompt. You do not need to clone anything.
      </p>
      <input class="search" id="q" type="search" placeholder="Search by name, job, or tag" value="${escapeHtml(q0)}" />
      <div class="chips" id="chips"></div>
      <div class="grid" id="grid"></div>
    </main>
  `;

  const qEl = document.getElementById("q");
  const chips = document.getElementById("chips");
  const grid = document.getElementById("grid");
  let category = CATEGORIES.includes(cat0) ? cat0 : "all";

  function paintChips() {
    const items = [["all", `All ${personas.length}`], ...CATEGORIES.map((k) => [k, LABELS[k]])];
    chips.innerHTML = items
      .map(
        ([k, label]) =>
          `<button type="button" class="chip${k === category ? " on" : ""}" data-cat="${k}">${label}</button>`,
      )
      .join("");
  }

  function paintGrid() {
    const results = searchList(qEl.value, category);
    if (!results.length) {
      grid.innerHTML = `<p class="empty">No matches. Try a last name, or a word such as outage, poem, or meeting.</p>`;
      return;
    }
    grid.innerHTML = results
      .map(
        (p) => `
        <a class="card" href="#/persona/${encodeURIComponent(p.id)}">
          <span class="cat">${LABELS[p.category] || p.category}</span>
          <h2>${escapeHtml(p.name)}</h2>
          <p>${escapeHtml(p.short_description)}</p>
        </a>`,
      )
      .join("");
  }

  paintChips();
  paintGrid();

  qEl.addEventListener("input", paintGrid);
  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    category = btn.getAttribute("data-cat");
    paintChips();
    paintGrid();
  });
}

function renderPersona(id) {
  setNav("nav-catalog");
  const persona = personas.find((p) => p.id === id);
  if (!persona) {
    $app.innerHTML = `
      <main class="wrap">
        <a class="back" href="#/">Catalog</a>
        <h1>Persona not found</h1>
        <p class="lede">There is no file for “${escapeHtml(id)}”.</p>
      </main>`;
    return;
  }

  const related = (persona.related_personas || [])
    .map((rid) => personas.find((p) => p.id === rid))
    .filter(Boolean);

  $app.innerHTML = `
    <main class="wrap" style="max-width:48rem">
      <a class="back" href="#/">Catalog</a>
      <p class="kicker">${LABELS[persona.category] || persona.category} / ${escapeHtml(persona.subcategory)}</p>
      <h1 class="name">${escapeHtml(persona.name)}</h1>
      <p class="desc">${escapeHtml(persona.description)}</p>
      <div class="actions">
        <button class="btn" type="button" id="copy-prompt">Copy system prompt</button>
        <button class="btn ghost" type="button" id="copy-id">Copy ID</button>
      </div>
      <p class="temp">Temperature ${escapeHtml(persona.compatibility?.recommended_temperature ?? "")}${
        persona.compatibility?.notes ? `. ${escapeHtml(persona.compatibility.notes)}` : ""
      }</p>

      <section class="section">
        <h2>When to use</h2>
        <ul>${(persona.recommended_use_cases || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        <h2 style="margin-top:1.5rem">When not to</h2>
        <ul>${(persona.anti_use_cases || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      </section>

      <section class="section">
        <h2>System prompt</h2>
        <pre id="prompt">${escapeHtml(persona.system_prompt)}</pre>
      </section>

      <section class="section">
        <h2>Examples</h2>
        ${(persona.example_interactions || [])
          .map(
            (ex) => `
          <article class="ex">
            <h3>${escapeHtml(ex.title)}</h3>
            <p class="who">You</p>
            <p>${escapeHtml(ex.user)}</p>
            <p class="who">Them</p>
            <p>${escapeHtml(ex.assistant)}</p>
          </article>`,
          )
          .join("")}
      </section>

      ${
        related.length
          ? `<section class="section">
        <h2>Related</h2>
        <ul>${related
          .map(
            (r) =>
              `<li><a href="#/persona/${encodeURIComponent(r.id)}"><span>${escapeHtml(r.name)}</span></a>. ${escapeHtml(r.short_description)}</li>`,
          )
          .join("")}</ul>
      </section>`
          : ""
      }

      <p class="temp">${escapeHtml(persona.id)} · ${escapeHtml(persona.version)} · ${escapeHtml(persona.license)}</p>
    </main>
  `;

  document.getElementById("copy-prompt").onclick = async () => {
    await navigator.clipboard.writeText(persona.system_prompt);
    document.getElementById("copy-prompt").textContent = "Copied";
    setTimeout(() => {
      document.getElementById("copy-prompt").textContent = "Copy system prompt";
    }, 1400);
  };
  document.getElementById("copy-id").onclick = async () => {
    await navigator.clipboard.writeText(persona.id);
  };
}

function renderGuide() {
  setNav("nav-guide");
  $app.innerHTML = `
    <main class="wrap" style="max-width:40rem">
      <h1>How to use a persona</h1>
      <p class="lede">
        Pick the persona whose job matches the work in front of you. Do not
        combine two prompts. Do not choose by how interesting the name sounds.
      </p>
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
    </main>
  `;
}

const data = await fetch("./personas.json").then((r) => r.json());
personas = data;
window.addEventListener("hashchange", route);
route();
