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
OUTPUT_PATH = os.path.join(REPO_ROOT, "audit-results-geo-points-warp.json")

# Deliberately empty. Add only a small, reviewed batch before running. Never
# point this tool at every class: some nodes execute callbacks during creation.
NODE_CLASSES = ["GeoPointsToMesh", "GeoProjectUV", "GeoTrilinearWarp", "GeoNoise", "GeoPoints"]

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
    "GeoPointsToMesh": {"confidence": False, "create_missing_parents": True, "depth": 8.0, "iso_divide": 8.0, "kernel_depth": 6.0, "no_clip_tree": False, "no_reset_samples": False, "parentPrimType": "Xform", "refine": 3.0, "samples_per_node": 1.0, "scale": 1.25, "selectable": True, "solver_divide": 8.0, "use_filtering": True, "use_selection": True, "verbose": False},
    "GeoProjectUV": {"frustum_culling": True, "generate_w": True, "inject_mask": False, "plane": "XY", "proj_plane_culling": False, "project_on": "both\tBoth", "projection": "perspective\tPerspective", "reference_frame": 1.0, "u_invert": False, "u_scale": 1.0, "use_reference_frame": False, "uv_attrib_name": "primvars:st", "uvw_attrib_name": "primvars:stw", "v_invert": False, "v_scale": 1.0},
    "GeoTrilinearWarp": {"inject_mask": False, "p0": [-0.5, -0.5, -0.5], "p1": [0.5, -0.5, -0.5], "p2": [0.5, 0.5, -0.5], "p3": [-0.5, 0.5, -0.5], "p4": [-0.5, -0.5, 0.5], "p5": [0.5, -0.5, 0.5], "p6": [0.5, 0.5, 0.5], "p7": [-0.5, 0.5, 0.5], "src0": [-0.5, -0.5, -0.5], "src1": [0.5, 0.5, 0.5], "src_use_bbox": True},
    "GeoNoise": {"amount": [1.0, 1.0, 1.0], "gain": 0.5, "geosnap_operation": "Geo to", "geosnap_rotate": False, "geosnap_scale": False, "geosnap_translate": True, "inject_mask": False, "lacunarity": 2.0, "mode": "fBm", "octaves": 2.0, "pivot_rotate": [0.0, 0.0, 0.0], "pivot_translate": [0.0, 0.0, 0.0], "rot_order": "ZXY", "rotate": [0.0, 0.0, 0.0], "skew": [0.0, 0.0, 0.0], "time": 0.0, "translate": [0.0, 0.0, 0.0], "uniform_scale": 1.0, "useMatrix": False, "xform_order": "SRT"},
    "GeoPoints": {"N_channel": "none", "P_channel": "none", "color_channel": "rgba", "create_missing_parents": True, "depth_channel": "depth.Z", "depth_type": "1/Z", "detail": 0.25, "geosnap_operation": "Geo to", "geosnap_rotate": False, "geosnap_scale": False, "geosnap_translate": True, "parentPrimType": "Xform", "point_size": 0.0001, "selectable": True, "translate": [0.0, 0.0, 0.0], "uniform_scale": 1.0, "useMatrix": False, "xform_order": "SRT"},
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
