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
OUTPUT_PATH = os.path.join(REPO_ROOT, "audit-results-map-depth-advanced.json")

# Deliberately empty. Add only a small, reviewed batch before running. Never
# point this tool at every class: some nodes execute callbacks during creation.
NODE_CLASSES = ["C_STMap2_1", "C_Blender2_1", "C_DisparityGenerator2_1", "EXPTool", "DepthGenerator"]

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
    "C_STMap2_1": {"blackOutside": False, "blur": "none", "blurScale": [1.0, 1.0], "channels": "all", "filter": "cubic\t\t\tCubic,Bicubic", "fringe": False, "inject": False, "interpolate": False, "invertMask": False, "map": "stmap", "maskChannelInput": "none", "mode": "warped src\t\t\tWarped src", "splatting": 2.0, "useGPUIfAvailable": True, "uv": "stitch_map", "xyz": "none"},
    "C_Blender2_1": {"blendSuppression": 0.125, "blendType": "Alpha", "expandBlend": True, "manualOverride": False, "useGPUIfAvailable": True},
    "C_DisparityGenerator2_1": {"consistency": 1.0, "consistencyThreshold": 1.0, "dilationSize": 5.0, "gradientThreshold": 1.0, "inputProjectionType": "Default", "leftView": "main", "maskWith": "None", "maxIterations": 30.0, "rightView": "main", "smoothness": 1.0, "strength": 5.0, "useGPUIfAvailable": True, "vectorDetail": 1.0, "vectorSpace": "Default (wrapped)", "warps": 3.0},
    "EXPTool": {"blackpoint": [0.0, 0.0, 0.0], "blue": 0.0, "channels": "rgb", "colorspace": "Linear", "fringe": False, "gang": True, "green": 0.0, "inject": False, "invert_mask": False, "invert_unpremult": False, "maskChannelInput": "none", "maskChannelMask": "alpha", "maskFromFlag": False, "mix": 1.0, "mode": "Densities", "red": 0.0, "unpremult": "none"},
    "DepthGenerator": {"N_channel": "none", "P_channel": "none", "accuracy": 0.0, "classic3D": False, "far": 10000.0, "frameSeparation": 1.0, "ignoreMask": "None", "markRegions": False, "near": 0.1, "noiseLevel": 0.01, "normalDetail": 0.25, "outputType": "Depth (1/Z)", "sharpness": 0.5, "smoothness": 0.5, "strength": 1.0, "vectorDetail": 0.5},
}

SPECIAL_TYPE_PARTS = (
    "Curve", "List", "Noodle", "PathExpression", "Roto", "Spline",
    "Table", "Transform2d", "IArray", "Format", "Tab", "FrameExtent",
    "TimeKnob", "Keyer", "Link", "Text", "ViewPair", "MetaData",
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
