# Grokbot Persona Database

Sixty system prompts for Grok and other chat models. Each one has a job, a speaking contract, refusals, and three worked examples.

**You do not need to clone this repository to use it.** Open the catalog, pick a name, copy the prompt.

The YAML in [`personas/`](personas/) is the source of truth for products and scripts. The catalog is how people actually use the files.

Curated by [Sully Vickers](https://github.com/sullyvickers1).

---

## Use a persona

1. Open the catalog and find the job you have (Ada Vale for an outage, Hollis for a long email).
2. Click **Copy system prompt**.
3. Paste it as the system message in Grok or any chat API.
4. Send the real draft, logs, or table. Start from the temperature on the page.

A static copy of the catalog ships in [`web/`](web/). Open `web/index.html` in a browser, or serve that folder. No build step.

## Load from a script

Node, from the repo root after `npm install`:

```js
import { loadPersona, toMessages } from "./examples/load-persona.mjs";

const persona = await loadPersona("ada-vale");
const messages = toMessages(persona, "The p99 just doubled after we enabled retries.");
```

Python (PyYAML required):

```bash
python examples/load_persona.py ada-vale "The p99 just doubled after we enabled retries."
```

## Start here

| ID | Job |
| --- | --- |
| [`ada-vale`](personas/professional/ada-vale.yaml) | Systems and incidents |
| [`elena-voss`](personas/professional/elena-voss.yaml) | Legal reasoning |
| [`maris-thorne`](personas/professional/maris-thorne.yaml) | History from sources |
| [`jonah-reed`](personas/professional/jonah-reed.yaml) | Product strategy |
| [`the-midwife`](personas/specialized/the-midwife.yaml) | Socratic tutor |
| [`the-diff`](personas/specialized/the-diff.yaml) | Code review |
| [`hollis`](personas/personality/hollis.yaml) | Fewest true words |
| [`cora-flint`](personas/personality/cora-flint.yaml) | Next physical action |
| [`lila-moreau`](personas/creative/lila-moreau.yaml) | Literary revision |
| [`grit`](personas/experimental/grit.yaml) | Ugly patch before lunch |

## What's inside

| Category | Count |
| --- | ---: |
| Professional | 20 |
| Creative | 12 |
| Personality | 14 |
| Specialized | 10 |
| Experimental | 4 |
| **Total** | **60** |

People have names. Specialized tools may be titles (`The Midwife`, `The Diff`) when the job is the identity. Given names and surnames are unique.

## Validate

```bash
npm install
npm run validate
npm run index
```

`validate` checks the schema, folder contract, unique names, and neighbor overlap. It does not run a live model.

## Layout

```text
web/               Browser catalog. Copy prompts here.
personas/          YAML source of truth, one file per persona
schemas/           JSON Schema
examples/          Node and Python loaders
templates/         New-persona templates
docs/              Format, best practices, versioning
scripts/           validate, index, YAML writer
catalog.json       Generated index. Do not hand-edit.
```

## Rules

1. Three sentences a neighbor would not say.
2. A prompt that changes the next answer: identity, thinking, speech, output, refusals.
3. Schema 1.1.0, including three examples in different situations.
4. No fake citations, no doctor/lawyer of record, no exploit kits.
5. If removing the name does not change the answers, it is not a persona.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Versioning

- The collection uses semver on the repo tag.
- Each persona has its own `version`. MAJOR means behavior change.
- IDs do not rename after publish. Deprecate and set `successor_id`.

## License

[MIT](LICENSE). Use these in products, research, and personal setups. Attribution is appreciated, not required.

## Status

v1.1.0. Sixty personas. Schema 1.1.0.
