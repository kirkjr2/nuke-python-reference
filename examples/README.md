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
