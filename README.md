# Nuke Python Reference

**Live reference:** https://nuke-python-reference.pages.dev/

Unofficial community reference for Nuke Python scripting.

The site provides a searchable reference for native Nuke nodes, their Python-facing arguments, defaults, example values, menu locations, and curated Python examples.

## Current reference

- Nuke version: **17.0v3**
- Nodes documented: **405**
- Reference Data Contract: **1.0.0**
- Preferred node creation style: `nuke.createNode("ClassName")`

## Features

- Browse nodes by Nuke category and menu hierarchy
- Collapsible category navigation
- Category landing pages and clickable breadcrumb navigation
- Ranked search across node classes, display names, arguments, knob labels/types, Python-facing types, values, menu paths, and descriptions
- Deep links to nodes and individual arguments
- Syntax-highlighted Python examples
- Editorial examples stored separately from scanner/reference data
- Lazy loading of individual node and example JSON files

Example routes:

```text
?node=Merge2
?node=Blur#arg-size
?category=3D/3D Classic
```

## Project structure

```text
index.html
app.js
styles.css

data/
  index.json
  manifest.json
  categories.json
  schemas/
  nodes/

examples/
  manifest.json
  nodes/
  reports/
  schemas/
```

The `data/` directory contains generated reference data. The `examples/` directory contains the separate editorial examples dataset.

## Run locally

From the repository directory:

```bat
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Corrections and feedback

The reference was generated from Nuke and then supplemented with editorial examples. Some specialized nodes may need corrections or better workflow examples over time.

If you find incorrect argument information, examples, node behavior, or missing documentation, please report it through GitHub Issues or submit a contribution. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Development pipeline

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

Generated reference files should not be manually edited when the same change belongs in the scanner or generator.

## Reuse and licensing

This project is intended to be open for reuse and repurposing.

Original software code and original project-authored material are released under the [MIT License](LICENSE), where this project has the right to grant that license.

The MIT license does **not** apply to third-party material owned by Foundry, Foundry licensors, community creators, or other rights holders. Reference data and examples may contain a mixture of original material, factual information generated from Nuke, and third-party-derived material.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) before redistributing the reference data or third-party-derived content.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for site version history.

## Disclaimer

This is an unofficial community project and is not affiliated with or endorsed by Foundry.

Nuke is a trademark of The Foundry Visionmongers Ltd.
