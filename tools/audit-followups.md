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

## Histogram

- `in` — `Range_Knob.setValue()` rejected a two-value sequence and reports that
  it expects three floats.
- Follow-up: inspect the three components in Nuke and rerun with an explicit
  three-value test before publishing a writable example.

## ParticleGravity

- `strength` — the `PositionVector_Knob` rejected a three-value sequence with
  `must be real number, not list`.
- Follow-up: audit its component-aware setter before documenting it as a
  directly writable vector argument.

## LiveGroup

- `modified` and `published` — Nuke 17.0v3 reports `read only variable`.
- Follow-up: present both as internal state indicators, not writable Python
  arguments.

## BigCat

- `isFirstTime` — Nuke 17.0v3 reports `read only variable`.
- Follow-up: mark it as internal/read-only.

## Text2

- `font` — `Font_Knob.setValue()` requires a component/index argument and does
  not support the ordinary one-value setter.
- Follow-up: document it as a compound/special scripting control.

## CopyCat

- `showValidation` — Nuke 17.0v3 reports `read only variable`.
- Follow-up: mark it as internal/read-only.

## CameraTracker

- `addReferenceFramesMenu` and `deleteReferenceFramesMenu` are
  `Pulldown_Knob` controls whose values are command tuples, not ordinary scalar
  arguments.
- Follow-up: classify pulldown menus as special UI/action controls.

## GridWarpTracker

- The internal `from_*` and `to_*` state fields ending in `_isInFromTree`,
  `_isSelected`, `_linked`, `_previous`, `_registered`, and `_relative` are
  read-only.
- Follow-up: omit these implementation-state controls from writable examples.
