# Best practices for writing personas

A good persona is a **tool someone will reach for twice**. A bad persona is a costume.

## Start from the job

Write the job in one sentence before you write the name.

- Bad: “A smart, friendly engineer who helps with anything technical.”
- Good: “Make the system fail more boringly, starting with a reversible mitigation.”

If you cannot name the job without using the word “helpful,” stop.

## Make a neighbor, then differ

Open the two existing personas a hurried user would confuse with yours. Write three sentences yours would say that they would not. If you cannot, merge or walk away.

Examples of real differences in this collection:

| Almost the same | Actual difference |
| --- | --- |
| Cynical realist vs empirical skeptic | Kane assumes incentives; Crowe demands a study. |
| Socratic tutor vs layered explainer | Midwife withholds answers; Moss layers them. |
| Steelman vs debate opponent | Holt improves your view; Cross tries to win on a burden. |
| Art director vs industrial designer | Shin is visual systems; Peck is form, manufacture, and hands. |

## Write the prompt as a contract

The system prompt is not a character sheet. It is standing orders.

Include:

1. **How they think** — numbered, in the order they actually work.
2. **How they speak** — shape and forbidden words, not “witty and warm.”
3. **Output contract** — the sections the user should expect every time.
4. **Hard rules** — refusals that would get a junior model in trouble (fake cites, stamps, exploits).
5. **Signature move** — the one maneuver that makes this file exist.

## Examples must do work

Three greetings are not three examples. Use different *situations*:

- The happy-path job.
- A case that should be refused or redirected.
- A case with missing information.

The assistant replies must be written in the persona’s voice. If you can swap replies between two files, both files fail.

## Intensity is a budget

At most two traits at 5. If everything is a 5, nothing is. Notes should say *how* the trait shows up (“names queues and timeouts”), not restate the adjective.

## Stay in lane on expertise

Professional personas teach reasoning and structure. They do not:

- Diagnose or dose a human.
- Act as counsel of record or stamp drawings.
- Invent papers, cases, or load tables.
- Write exploits or concealment instructions.

Put that in `hard rules` and in an example so the model sees it twice.

## Temperature is a hint, not a personality

Low (0.2–0.35) for forensic, clinical, legal, security, quant.
Mid (0.35–0.55) for strategy, teaching, coaching.
High (0.55–0.9) for generative creative and experimental voices.

If you need 1.2 to make the persona interesting, the prompt is weak.

## Edit like a miser

Cut any sentence that could sit in any other persona unchanged. Especially:

- “I am an AI…”
- “I’ll do my best to help!”
- “Let’s dive in.”
- “As an expert in many fields…”

## Deprecate, don’t ghost

Behavior breaks get a MAJOR bump or a new ID. Users who pinned `ada-vale@1.x` should not wake up to a poet.
