# Contributing to Nuke Python Reference

Contributions, corrections, reuse, and repurposing are welcome.

The main goal is to keep the reference technically accurate and useful across Nuke versions without making unsupported assumptions about node behavior.

## Report a correction

For documentation corrections, the preferred route is the **Reference correction** GitHub issue form.

Useful reports include:

- incorrect node or knob names
- incorrect Python types
- incorrect default values
- missing or incorrect allowed/example values
- incorrect descriptions
- Python examples that do not work
- incorrect menu/category locations
- differences between Nuke versions
- better practical examples for specialized nodes

Please include the Nuke version you tested whenever possible.

## Pull requests

Pull requests are welcome for website code, documentation, examples, and reference corrections.

For reference-data corrections, explain how the change was verified. Good verification sources include:

- behavior tested directly in Nuke
- Foundry documentation
- Nuke Python API documentation
- reproducible Python snippets
- screenshots or node/knob inspection output

Community tutorials and production examples can be useful supporting evidence, but they should not override directly verified Nuke behavior or Foundry documentation.

## Generated reference data

The project separates generated reference data from editorial examples.

```text
Nuke
  ↓
Scanner
  ↓
Raw node data
  ↓
Reference generator
  ↓
Normalized reference data
  ↓
Website + editorial examples
```

If a problem originates in scanner or generator output, prefer fixing the source pipeline rather than manually patching generated JSON files. This keeps future scans reproducible.

## Editorial examples

Examples should:

- prefer `nuke.createNode("ClassName")` for node creation
- use real node and knob names
- demonstrate a practical reason to use the node when possible
- keep comments concise and relevant
- avoid inventing API calls for interactive operations
- avoid arbitrary shot-specific values when they could imply incorrect behavior
- note version-specific behavior when known

Examples do not need to demonstrate every knob. A few useful examples are preferable to repetitive examples that only set arbitrary values.

## Reuse and repurposing

The project is intended to be reusable. You are welcome to adapt the website code, build tools on top of the reference data, use the data in editor integrations, or repurpose the project for other documentation workflows, subject to the repository license and any third-party rights that apply to source material.

When redistributing generated or extracted Nuke/Foundry-derived material, contributors should preserve appropriate attribution and avoid implying that a derivative project is an official Foundry product.

## Style

Keep changes focused. Avoid unrelated formatting changes in the same pull request as a technical correction.

For Python examples, favor readable Nuke scripting patterns over compressed one-liners.

## Questions

If you are unsure whether something is a scanner problem, generator problem, website problem, or editorial correction, open an issue with the node/page and what you observed.
