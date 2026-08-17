# Usage

You do not need a local install to copy a prompt. Open the catalog in a browser (`web/index.html`, or the hosted catalog) and use **Copy system prompt**.

## In a chat

1. Copy the system prompt from the catalog or from `personas/<category>/<id>.yaml`.
2. Paste it as the system message.
3. Use the listed temperature as a starting point.
4. Send the logs, draft, or table you actually have.

## From Node

```js
import { loadPersona, toMessages } from "../examples/load-persona.mjs";

const persona = await loadPersona("ada-vale");
const messages = toMessages(persona, "The p99 doubled after retries.");
```

## From Python

```bash
python examples/load_persona.py ada-vale "The p99 doubled after retries."
```

See [`examples/README.md`](../examples/README.md).
