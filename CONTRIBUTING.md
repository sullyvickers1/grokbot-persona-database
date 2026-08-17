# Contributing

This collection stays useful only if it stays **strict**. We would rather reject a charming prompt than let a near-duplicate in.

Read this before you open a PR. Maintainers will close incomplete submissions without a debate.

## What we accept

- A **new persona** that does a job no current persona does.
- A **revision** that makes an existing persona more precise without breaking its ID’s behavior (or that bumps MAJOR and explains the break).
- A **schema or tooling** change that makes validation stricter or loading easier.
- A **documentation** fix that removes ambiguity.

## What we reject

- “Act as X” one-liners and celebrity / copyrighted-character impersonation.
- Near-duplicates of an existing persona (see uniqueness test).
- Personas whose only difference is aesthetic (“edgier engineer,” “funnier tutor”).
- Fake citations, invented case law, or prompts that claim to be the user’s doctor, lawyer, or PE.
- Anything that helps with crimes, exploits, self-harm methods, or concealment of assets.
- Drive-by dumps of 10 half-finished YAML files.
- Recycled given names or surnames. `Ada Vale` and `Ada Kim` is how a factory names people.

## Uniqueness test (required)

In the PR body, name **two neighbor personas** and paste **three sentences** your persona would say that those neighbors would not.

If a reviewer can swap the name and the answers still fit the neighbor, the PR fails.

CI also fails the PR if:

- a given name or surname is reused
- example replies overlap a listed neighbor too much (token Jaccard)
- two personas share a signature move
- two personas share the same `compatibility.notes`

That is a floor, not the test. A live model can still collapse two voices. Run the pairs in [`docs/evals/collision-pairs.md`](docs/evals/collision-pairs.md) when you touch a crowded neighborhood.

## Naming

- **People** (professional, creative, most personality): first name + surname, both unique in the collection.
- **Mononyms** are allowed for personality archetypes (Hollis, Wren, Moss, Grit) when the voice is a stance, not a résumé.
- **Titles** are allowed in specialized/experimental when the job *is* the identity (`The Midwife`, `The Diff`, `ORION-7`).
- Do not name someone after the trait (`Reed Blunt`). Given names and surnames must be unique across the collection.

## File contract

1. Copy [`templates/persona.template.yaml`](templates/persona.template.yaml).
2. `id` is kebab-case, stable, and matches the filename.
3. `slug` equals `id`.
4. `category` matches the parent folder.
5. `schema_version` is `1.1.0`.
6. `system_prompt` is at least 720 characters and does these jobs (headings optional):
   - Identity
   - Charge (one-sentence mission)
   - How you think
   - How you speak
   - Output contract
   - Hard rules
   - Signature move — or an equivalent “tell”
7. At least **three** `example_interactions` in different situations. The assistant replies must *sound like* the persona. Creative personas should return an artifact (a stanza, a scene, a shot, a claim line), not only advice about one.
8. At most **two** personality traits at intensity 5. Prefer a specific trait (`hunk-strict`) over wallpaper (`calm`, `precise`, `patient`).
9. `related_personas` lists real IDs.
10. `license` is `MIT`.
11. `successor_id` is omitted unless the persona is deprecated.
12. `compatibility.notes` is one sentence that could only belong to this file.

Run locally:

```bash
npm run validate
npm run index
```

CI runs the same checks. A red X is not a suggestion.

## Review checklist (maintainers)

- [ ] Uniqueness test is specific, not “they have a different vibe.”
- [ ] System prompt would change a user’s next action, not just the tone.
- [ ] Examples are not three restatements of the same move.
- [ ] Refusals are real (citations, professional stamps, weapons, self-harm).
- [ ] Neighbors in `related_personas` are the ones a hurried user would actually confuse.
- [ ] Name does not collide.
- [ ] No schema warnings.

## Version bumps

| Change | Bump |
| --- | --- |
| Typo, tighter wording, extra example that does not change behavior | PATCH |
| New guideline, new domain, stronger contract, same job | MINOR |
| Different job, different refusals, different output shape | MAJOR, or a new ID |

Never rename an ID after it has been published. Set `status: deprecated` and `successor_id`.

## Voice of the project

Documentation is plain and slightly formal. No emoji in docs, YAML, or commit titles. No “awesome” lists. No hype adjectives that could apply to any persona. Do not call this the definitive standard. Other people decide that by citing it.

## Code of conduct

Be specific and civil. Review the work, not the person. Harassment gets you removed.

## License

By contributing you agree your work is MIT-licensed, same as the repository.
