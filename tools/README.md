# Nuke batch audit

Open a new empty Nuke script, then run `nuke_batch_audit.py` from the Script
Editor:

```python
import runpy
runpy.run_path(r"C:\path\to\nuke-python-reference\tools\nuke_batch_audit.py")
```

The checked-in audit contains one small, manually reviewed batch. Confirm the
`NODE_CLASSES` list before each run; replace it only with another small batch
whose `TEST_VALUES` were chosen specifically for those knobs. The script
checkpoints `audit-results.json` after every node.

Do not generate test values from scanner defaults/examples and do not run all
node classes in one session. Tracker, roto, plug-in, compound, and action knobs
can execute callbacks or reject replayed state and may destabilize Nuke.

Run this in a disposable Nuke session. Some installed node classes may display
license warnings or require plug-ins that are unavailable on another machine.
