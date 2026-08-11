# Changelog

Notable changes to the Nuke Python Reference site are tracked here.

## v12

- Made the **Nuke Python Reference** title in the upper-left link back to the main reference page.
- Prepared the site as the initial publish candidate.

## v11

- Integrated the editorial examples dataset for all 405 nodes.
- Replaced the hard-coded seven-node examples block with lazy-loaded per-node example JSON files.
- Kept editorial status and provenance in the data layer without adding UI clutter.

## v10

- Fixed menu-path hierarchy so the final path segment is treated as the node rather than another category.
- Corrected breadcrumbs such as `Reference > Filter > Blur`.
- Added handling for obsolete leaf-category URLs such as `?category=Filter/Blur`.

## v9

- Added collapsible top-level category navigation.
- Added clickable category landing pages.
- Added clickable breadcrumb hierarchy.
- Removed the description-source label from node pages.
- Removed the redundant node-title link.

## v8

- Expanded the site to all 405 scanned nodes.
- Added ranked search across node names, arguments, knob types, values, paths, and descriptions.
- Added deep links to node pages and individual arguments.
- Added per-argument anchors.
- Established Reference Data Contract `1.0.0`.
- Added JSON Schema files and provenance metadata.

## Earlier prototypes

Earlier versions established the visual design, Nuke-inspired color palette, Maya-style synopsis and arguments layout, syntax highlighting, generator pipeline, scanner pipeline, and initial node-discovery fixes. These were development iterations rather than public releases.
