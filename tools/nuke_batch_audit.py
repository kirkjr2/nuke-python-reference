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
OUTPUT_PATH = os.path.join(REPO_ROOT, "audit-results-rays-motion.json")

# Deliberately empty. Add only a small, reviewed batch before running. Never
# point this tool at every class: some nodes execute callbacks during creation.
NODE_CLASSES = ["MotionBlur", "DirBlurWrapper", "GodRays", "VolumeRays", "BumpBoss"]

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
    "MotionBlur": {
        "computedVectorFlag": 1.0, "flickerCompensation": False,
        "maskFlag": 1.0, "matteChannel": "None", "motionEstimation": "Local",
        "resampleType": "Bilinear", "shutterSamples": 3.0,
        "shutterTime": 0.75, "smoothnessLocal": 0.5, "strengthReg": 1.5,
        "useGPUIfAvailable": False, "vectorDetailLocal": 0.2,
        "vectorDetailReg": 0.3, "vectorSourceFlag": 1.0,
        "warpSourceFlag": 1.0, "weightBlue": 0.1,
        "weightGreen": 0.6, "weightRed": 0.3,
    },
    "DirBlurWrapper": dict(COMMON_MASK_VALUES, BlurAngle=45.0, BlurCenter=[960.0,540.0], BlurLayer="rgb", BlurLength=5.0, BlurType="linear", PixelAspect=1.0, Quality=1.0, Samples=8.0, UseTarget=False, channels="rgb", holdout="none", pixeloffset=0.0, target=[960.0,540.0]),
    "GodRays": dict(COMMON_MASK_VALUES, center=[960.0,540.0], channels="rgb", from_color=1.0, gamma=1.0, max=False, rotate=0.0, scale=1.0, skew=0.0, steps=8.0, to_color=1.0, translate=[0.0,0.0]),
    "VolumeRays": {"CCorrect1_gain":1.0,"CCorrect1_gamma":1.0,"blur_size":[3.0,3.0],"chk_desat":False,"chk_flicker":True,"chk_radial":True,"chk_use_mask":False,"chk_xform_mask":False,"comp_me":False,"edge_size":0.0,"flicker_size":40.0,"flicker_speed":2.0,"initcolor":1.0,"luma_tol":0.0,"mask_blur":0.0,"pre_blur":0.0,"quality":"Medium","rad_softness":1.0,"radial_size":500.0,"raylength":[20.0,20.0],"style":"RGB Luminance","vol_pos":[960.0,540.0],"volume_end_color":0.0,"xform_flicker":False},
    "BumpBoss": dict(COMMON_MASK_VALUES, bumpsize=[1.0,1.0], center=[960.0,540.0], channels="rgb", height=1.0, intensity=1.0, lightposition=[960.0,540.0], minshadow=0.0),
}

SPECIAL_TYPE_PARTS = (
    "Curve", "List", "Noodle", "PathExpression", "Roto", "Spline",
    "Table", "Transform2d", "IArray", "Format", "Tab", "FrameExtent",
    "TimeKnob", "Keyer", "Link", "Text", "ViewPair",
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
