# Nuke batch audit

Open a new empty Nuke script, then run `nuke_batch_audit.py` from the Script
Editor:

```python
import runpy
runpy.run_path(r"C:\path\to\nuke-python-reference\tools\nuke_batch_audit.py")
```

The audit creates each scanned node class, tests ordinary value knobs, deletes
the node, and writes `audit-results.json` in the repository root. Compound
controls and UI actions are classified separately instead of being treated as
ordinary values.

Run this in a disposable Nuke session. Some installed node classes may display
license warnings or require plug-ins that are unavailable on another machine.
