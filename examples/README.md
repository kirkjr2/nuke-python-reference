# Nuke Reference Examples v5 — Remaining Queue Complete

This build processes the entire remaining editorial queue.

All 405 nodes now have an editorial state. The former 352-node PARTIAL_EDITORIAL
queue has been converted to FUNCTIONAL_EDITORIAL using:

- locked scanner node and knob data,
- Foundry node-creation conventions,
- practical Nuke Python graph patterns,
- creator-source scripting patterns,
- explicit avoidance of invented interactive API calls.

`reports/editorial_priority_remaining.csv` is intentionally empty.

`reports/optional_deep_dive.csv` contains specialized nodes that could still
benefit from richer node-specific tutorials later, without blocking publication.

## Practical example policy

Reviewed examples should solve a recognizable compositor task rather than merely
set unrelated knobs. Public artist tutorials, TD blogs, and Foundry documentation
may inform the underlying workflow, but published examples must use original code,
wording, values, node names, and structure.

Use one combined workflow by default. Publish multiple examples only when they
solve materially different problems. Examples should be runnable in an empty Nuke
script when practical, label important nodes, connect inputs explicitly, and avoid
requiring artists to rename existing nodes before the example works.

Source material is tracked in `sources.json` for provenance. It is inspiration and
technical corroboration, not text or code to reproduce.
