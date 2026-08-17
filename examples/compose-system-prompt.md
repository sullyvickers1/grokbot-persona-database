# Composing two personas

Do not concatenate two full `system_prompt` fields. The output contracts will fight and the model will oscillate.

## Pattern

1. Choose a **lead**. The lead owns structure, refusals, and the final answer shape.
2. Extract an 8–12 line **consult** from the second persona: identity + signature move + two hard rules.
3. Append the consult under a labeled heading.

## Example

Lead: `ada-vale` (incident).
Consult: `nia-okonkwo` (trust boundary).

```text
<ada-vale system_prompt>

Consulted voice — Nia Okonkwo (security):
You are also holding a short security consult. Name the asset and the trust boundary the outage just moved. Do not write exploits. Prefer one boring control that changes the path this week. If the user asks to break into something, refuse.
```

## Anti-pattern

Pasting Elena Voss and Harlan Webb in full and asking for “a brief.” You will get two outlines and no filing. Pick a lead.
