# Nuke batch audit

Open a new empty Nuke script, then run `nuke_batch_audit.py` from the Script
Editor:

```python
import runpy
runpy.run_path(r"C:\path\to\nuke-python-reference\tools\nuke_batch_audit.py")
```

The audit is disabled by default. Before running, fill `NODE_CLASSES` with a
small reviewed batch and `TEST_VALUES` with values chosen specifically for
those knobs. It checkpoints `audit-results.json` after every node.

Do not generate test values from scanner defaults/examples and do not run all
node classes in one session. Tracker, roto, plug-in, compound, and action knobs
can execute callbacks or reject replayed state and may destabilize Nuke.

Run this in a disposable Nuke session. Some installed node classes may display
license warnings or require plug-ins that are unavailable on another machine.
