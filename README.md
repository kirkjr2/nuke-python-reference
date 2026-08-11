# Nuke Python Reference Site v8

This is the first full-data site build.

## Included

- All 405 nodes from the Nuke 17.0v3 v5 scan
- Data Contract 1.0.0
- JSON Schema files
- Category navigation
- Ranked search across:
  - node class/display name
  - arguments
  - labels
  - knob types
  - Python types
  - allowed/example values
  - menu paths
  - descriptions
- Lazy loading of individual node files
- Deep links:
  - `?node=Blur`
  - `?node=Blur#arg-size`
- Per-argument anchors/permalinks
- Existing curated examples for Blur, Merge2, Grade, Transform, Read, Write, and Shuffle2

## Run locally

```bat
python -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

Test deep links:

```text
http://localhost:8000/?node=Merge2
http://localhost:8000/?node=Blur#arg-size
```


## v9 navigation changes
- Removed description-source text.
- Removed node-title link.
- Collapsible top-level categories.
- Clickable category landing pages and breadcrumb hierarchy.
- Category URLs use `?category=3D/3D Classic/Light`.


## v10 leaf-path fix

The final segment of a node menu path is now treated as the node itself, not a category.

`Filter/Blur` renders as:

`Reference > Filter > Blur`

Only `Reference` and `Filter` are links. `Blur` is plain text because it is the current node.

If a leaf path such as `?category=Filter/Blur` is opened manually, the site redirects it to the Blur node page.


## v11 examples integration

The site now lazy-loads the editorial examples dataset from:

```text
examples/nodes/<ClassName>.json
```

The hard-coded seven-node example object has been removed.

Editorial status and provenance remain in the JSON files for later review, but
the approved website UI only displays example title and syntax-highlighted code.


## v12 publish candidate

The `Nuke Python Reference` title in the upper-left is now a home link back to
the main reference page. No other UI or data changes were made.
