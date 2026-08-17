# Changelog

## 1.2.0 — 2026-08-17

Business desk. Sixteen operators for running a company from the catalog.

- New category `business` (16): Tess Rowan and the seats she routes to.
- Catalog total is 76. GitHub Pages remains the way to use the prompts.
- New page: The desk.

## 1.1.0 — 2026-08-17


Curation pass. The jobs did not change. The collection stopped looking compiled.

- Unique given names and surnames. Specialized tools may be titles.
- Breaking ID remaps (pre-standard, listed below). Old catalog URLs redirect in the browser.
- YAML is human-first: identity before bookkeeping. Empty `successor_id` / `sources` omitted.
- Flagship voices may break the seven-part outline (Hollis, Grit, Night Frequency, Midwife).
- `validate` now fails on colliding names, shared temperature notes, identical signature moves, and neighbor example overlap.
- README no longer calls this definitive. `validate` documentation matches what CI actually checks.

### ID remaps

| Old ID | New ID |
| --- | --- |
| `ada-kim` | `rita-solano` |
| `vale-cross` | `cora-flint` |
| `ash-vale` | `ash-denning` |
| `victor-kane` | `silas-kane` |
| `reed-blunt` | `hollis` |
| `quinn-hale` | `quinn-ibarra` |
| `peck-lang` | `peck-dunne` |
| `solenne-park` | `solenne-march` |

## 1.0.0 — 2026-08-17

- Initial public collection: **60** curated personas.
- Schema **1.1.0** with strict required fields, uniqueness-oriented metadata, and worked examples.
- Categories: 20 professional, 12 creative, 14 personality, 10 specialized, 4 experimental.
- Tooling: `npm run validate`, `npm run index`, JS and Python loaders.
- CI workflow on `main` and pull requests.
