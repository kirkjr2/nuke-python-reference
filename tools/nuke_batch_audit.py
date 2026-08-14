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
OUTPUT_PATH = os.path.join(REPO_ROOT, "audit-results-livegroup-corrected.json")

# Deliberately empty. Add only a small, reviewed batch before running. Never
# point this tool at every class: some nodes execute callbacks during creation.
NODE_CLASSES = ["LiveGroup"]

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

PARTICLE_COMMON = {"display": "unchanged", "max_age": 1.0, "min_age": 0.0, "pivot_rotate": [0.0, 0.0, 0.0], "pivot_translate": [0.0, 0.0, 0.0], "probability": 1.0, "region": "none", "region_invert": False, "render_mode": "unchanged", "rot_order": "ZXY", "rotate": [0.0, 0.0, 0.0], "scaling": [1.0, 1.0, 1.0], "seed": 0.0, "selectable": True, "skew": [0.0, 0.0, 0.0], "translate": [0.0, 0.0, 0.0], "uniform_scale": 1.0, "useMatrix": False, "xform_order": "SRT"}
GEO_COMMON = {"create_missing_parents": True, "geosnap_operation": "Geo to", "geosnap_rotate": False, "geosnap_scale": False, "geosnap_translate": True, "parentPrimType": "Xform", "pivot_rotate": [0.0, 0.0, 0.0], "pivot_translate": [0.0, 0.0, 0.0], "prim_path": "{nodename}", "rot_order": "ZXY", "rotate": [0.0, 0.0, 0.0], "scaling": [1.0, 1.0, 1.0], "selectable": True, "skew": [0.0, 0.0, 0.0], "translate": [0.0, 0.0, 0.0], "uniform_scale": 1.0, "useMatrix": False, "xform_order": "SRT"}
MESH_COMMON = dict(GEO_COMMON, columns=30.0, display_color=[0.18, 0.18, 0.18], display_opacity=1.0, double_sided=True, interpolate_boundary="none", kind="subcomponent", mesh_type="separateVertices\tseparate vertices", normals="faceVarying\tface-vertex", purpose="default", rows=30.0, subdivision_scheme="none", visibility="inherited")
LIGHT_COMMON = dict(GEO_COMMON, display="wireframe", editable=True, inject_mask=False, inputs_color=[1.0, 1.0, 1.0], inputs_colorTemperature=6500.0, inputs_diffuse=1.0, inputs_enableColorTemperature=False, inputs_exposure=0.0, inputs_intensity=1.0, inputs_normalize=False, inputs_specular=1.0, locator_fill_color=[0.8, 0.8, 0.8], locator_fixed_size=False, locator_use_light_for_fill_color=True, mode="Create", xform_op_order="Prepend")

TEST_VALUES = {
    "LiveGroup": {"disable_group_view": False, "group_view_position": "top-left", "on_error": "error", "output": "", "reading": False, "show_group_view": False, "shownWarningFile": "", "useOutput": False, "version": 0.0},
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
