# Audit follow-ups

Nodes in this list need a dedicated audit or documentation override. Ordinary
batches should skip the listed controls and continue processing other nodes.

## Deblur

- `isFirstTime` — Nuke 17.0v3 reports `read only variable`.
- `tileOverlap` — Nuke 17.0v3 reports `read only variable`.
- `tileSize` — Nuke 17.0v3 reports `read only variable`.
- Follow-up: mark these controls as read-only/derived in the editorial layer and
  do not present them as writable Python arguments.

## Upscale

- `isFirstTime` — Nuke 17.0v3 reports `read only variable`.
- Follow-up: mark it as internal/read-only; `tileOverlap` and `tileSize` remain
  writable on this node.

## Inference

- `isFirstTime` — Nuke 17.0v3 reports `read only variable`.
- Follow-up: mark it as internal/read-only.
