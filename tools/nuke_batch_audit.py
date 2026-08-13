r"""Conservatively audit explicitly selected Nuke nodes and write JSON results.

Run from Nuke's Script Editor:
    import runpy
    runpy.run_path(r"C:\path\to\nuke-python-reference\tools\nuke_batch_audit.py")
"""

import json
import os
import traceback

import nuke


REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO_ROOT, "data", "nodes")
OUTPUT_PATH = os.path.join(REPO_ROOT, "audit-results-core-image.json")

# Deliberately empty. Add only a small, reviewed batch before running. Never
# point this tool at every class: some nodes execute callbacks during creation.
NODE_CLASSES = ["Constant", "ColorCorrect", "Dilate", "Defocus", "EdgeBlur"]

# Values must be reviewed per node and knob. Scanner values are reference data,
# not a safe replay script.
COMMON_MASK_VALUES = {
    "fringe": False,
    "inject": False,
    "invert_mask": False,
    "invert_unpremult": False,
    "maskChannelInput": "none",
    "maskChannelMask": "alpha",
    "maskFromFlag": False,
    "mix": 0.75,
    "unpremult": "none",
}

TEST_VALUES = {
    "Constant": {
        "channels": "rgba", "color": [0.18, 0.18, 0.18, 1.0],
        "first": 1.0, "last": 100.0,
    },
    "ColorCorrect": dict(
        COMMON_MASK_VALUES,
        channels="rgb", saturation=0.95, contrast=1.08, gamma=1.03,
        gain=1.02, offset=0.01, enable_mix_luminance=True,
        mix_luminance=0.25, test=False,
        **{
            "shadows.saturation": 0.9, "shadows.contrast": 1.02,
            "shadows.gamma": 1.0, "shadows.gain": 0.98,
            "shadows.offset": 0.0, "midtones.saturation": 1.0,
            "midtones.contrast": 1.04, "midtones.gamma": 1.02,
            "midtones.gain": 1.0, "midtones.offset": 0.0,
            "highlights.saturation": 1.0, "highlights.contrast": 1.0,
            "highlights.gamma": 1.0,
            "highlights.gain": [1.08, 1.03, 0.96, 1.0],
            "highlights.offset": 0.0,
        }
    ),
    "Dilate": dict(
        COMMON_MASK_VALUES, channels="alpha", size=[2.0, 2.0]
    ),
    "Defocus": dict(
        COMMON_MASK_VALUES, channels="rgb", defocus=8.0,
        method="accelerated", quality=20.0, ratio=1.0,
        scale=[1.0, 1.0],
    ),
    "EdgeBlur": dict(
        COMMON_MASK_VALUES, brightness=1.0, channels="rgba",
        controlchannel="alpha", crop=True, edge_mult=2.0,
        filter="gaussian", output="none", quality=15.0,
        size=[3.0, 3.0], tint=1.0,
    ),
}

SPECIAL_TYPE_PARTS = (
    "Curve", "List", "Noodle", "PathExpression", "Roto", "Spline",
    "Table", "Transform2d", "IArray", "Format", "Tab",
)
ACTION_TYPES = {"Button_Knob", "PyScript_Knob", "Script_Knob"}


def audit_argument(node, node_class, name, argument):
    knob = node.knob(name)
    if knob is None:
        return {"status": "failed", "error": "knob does not exist"}

    knob_type = knob.Class()
    base = {"knob_type": knob_type, "visible": bool(knob.visible())}

    if knob_type in ACTION_TYPES:
        return dict(base, status="skipped-action")
    if any(part in knob_type for part in SPECIAL_TYPE_PARTS):
        return dict(base, status="skipped-special", serialized=knob.toScript())

    node_tests = TEST_VALUES.get(node_class, {})
    if name not in node_tests:
        return dict(base, status="inspected-only")
    value = node_tests[name]

    try:
        knob.setValue(value)
        actual = knob.value()
        return dict(base, status="passed", tested_value=value, readback=repr(actual))
    except Exception as error:
        return dict(base, status="failed", tested_value=value, error=str(error))


def audit_node(path):
    with open(path, encoding="utf-8") as stream:
        scanned = json.load(stream)

    node_class = scanned["identity"]["class"]
    result = {"class": node_class, "arguments": {}}

    try:
        node = nuke.createNode(node_class, inpanel=False)
    except Exception as error:
        result.update(status="creation-failed", error=str(error))
        return result

    try:
        for name in scanned.get("argument_order", []):
            argument = scanned["arguments"][name]
            result["arguments"][name] = audit_argument(node, node_class, name, argument)

        statuses = [item["status"] for item in result["arguments"].values()]
        result["status"] = "failed" if "failed" in statuses else "completed"
        result["counts"] = {
            status: statuses.count(status) for status in sorted(set(statuses))
        }
        return result
    finally:
        nuke.delete(node)


def main():
    if not NODE_CLASSES:
        raise RuntimeError(
            "Audit disabled until NODE_CLASSES and reviewed TEST_VALUES are "
            "filled with a small safe batch. Do not run all scanned nodes."
        )
    paths = [os.path.join(DATA_DIR, "{}.json".format(name)) for name in NODE_CLASSES]
    results = []

    print("Auditing {} Nuke node classes...".format(len(paths)))
    for index, path in enumerate(paths, 1):
        try:
            result = audit_node(path)
        except Exception:
            result = {
                "class": os.path.splitext(os.path.basename(path))[0],
                "status": "audit-crashed",
                "error": traceback.format_exc(),
            }
        results.append(result)
        print("[{}/{}] {}: {}".format(index, len(paths), result["class"], result["status"]))

        payload = {
            "nuke_version": nuke.NUKE_VERSION_STRING,
            "node_count": len(results),
            "results": results,
        }
        with open(OUTPUT_PATH, "w", encoding="utf-8") as stream:
            json.dump(payload, stream, indent=2, sort_keys=True)

    payload = {
        "nuke_version": nuke.NUKE_VERSION_STRING,
        "node_count": len(results),
        "results": results,
    }
    with open(OUTPUT_PATH, "w", encoding="utf-8") as stream:
        json.dump(payload, stream, indent=2, sort_keys=True)

    print("\nAudit complete: {}".format(OUTPUT_PATH))


main()
