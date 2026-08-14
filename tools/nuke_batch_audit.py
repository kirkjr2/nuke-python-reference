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
OUTPUT_PATH = os.path.join(REPO_ROOT, "audit-results-lens-advanced.json")

# Deliberately empty. Add only a small, reviewed batch before running. Never
# point this tool at every class: some nodes execute callbacks during creation.
NODE_CLASSES = ["LensDistortion2", "SphericalTransform2", "C_GlobalWarp2_1", "C_Blur2_1", "Deblur"]

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
    "LensDistortion2": {"anamorphicScale": [1.0, 1.0], "anamorphicSqueeze": 1.0, "anamorphicTwist": 0.0, "angleThreshold": 8.0, "bboxBackupSet": False, "bboxType": "Auto", "beamSplitterBending": 0.0, "beamSplitterDirection": 0.0, "centre": [960.0, 540.0], "detectionFrameSpacing": 5.0, "detectionFrameType": "Current Frame", "detectionThreshold": 100.0, "detectionType": "Grids", "distanceThreshold": 30.0, "distortInFisheyeSpace": True, "distortionExponent": 2.0, "distortionModelDirection": "Forward", "distortionModelPreset": "NukeX Classic", "distortionModelType": "Radial Standard", "distortionScalingType": "Scale To Input Format", "distortionXY": [0.0, 0.0], "enableBeamSplitter": False, "filter": "cubic\t\t\tCubic,Bicubic", "focal": 9.0, "lens": "Spherical", "normalisationType": "Maximum", "output": "STMap", "outputFormatType": "Input", "preview": False, "projection": "None (Rectilinear)", "sensorSize": [36.0, 24.0], "useFisheye": True, "useGPUIfAvailable": True},
    "SphericalTransform2": {"KInput": [0.0, 0.0, 0.0], "KOutput": [0.0, 0.0, 0.0], "adjustBBox": 0.0, "angleInput": 0.0, "angleOutput": 0.0, "convergence": 10.0, "cubemapPackingInput": "LL-Cross", "cubemapPackingOutput": "LL-Cross", "fisheyeTypeInput": "Equidistant", "fisheyeTypeOutput": "Equidistant", "focalInput": 16.0, "focalOutput": 16.0, "formatMode": "To Scale", "fromInput": [0.0, 0.0], "fromOutput": [0.0, 0.0], "metaDataOperation": "Ignore", "modeInput": "Pan-Tilt-Roll", "modeOutput": "Pan-Tilt-Roll", "octant": "-Z", "packingTypeInput": "Faces", "packingTypeOutput": "Image", "panTiltRollInput": [0.0, 0.0, 0.0], "panTiltRollOutput": [0.0, 0.0, 0.0], "positionInput": [0.0, 0.0, 0.0], "positionOutput": [0.0, 0.0, 0.0], "projTypeInput": "Latlong", "projTypeOutput": "Latlong", "resampleType": "cubic\t\t\tCubic,Bicubic", "rotationAnglesInput": [0.0, 0.0, 0.0], "rotationAnglesOutput": [0.0, 0.0, 0.0], "rotationOrderInput": "ZXY", "rotationOrderOutput": "ZXY", "scale": 1.0, "sensorInput": [36.0, 24.0], "sensorOutput": [36.0, 24.0], "shiftInput": [0.0, 0.0], "shiftOutput": [0.0, 0.0], "toInput": [0.0, 0.0], "toOutput": [0.0, 0.0], "useGPUIfAvailable": True, "width": 2048.0},
    "C_GlobalWarp2_1": {"addPoint": False, "analysisKeyframe": 1.0, "autoConvergenceDepth": True, "blendSuppression": 0.125, "blendType": "Alpha", "cameraOutputMode": "Unwarped", "cameraProjectionType": "Default (pass-through)", "constraintColour": [1.0, 1.0, 1.0], "constraintEndFrame": 10.0, "constraintStartFrame": 1.0, "constraintStrength": 4.0, "convergenceDepth": 10.0, "expandBlend": True, "focalLength": 16.0, "gridSize": 10.0, "kernelType": "Linear", "keyStep": 30.0, "manualOverride": False, "matchStrength": 2.0, "outputMode": "Warped", "projectionType": "Spherical", "rectilinearProjection": False, "resampleType": "Cubic", "rotationAngles": [0.0, 0.0, 0.0], "rotationOrder": "ZXY", "showCameras": True},
    "C_Blur2_1": {"accuracy": 1.0, "bilinear": False, "channels": "rgb", "crop": True, "factor": 1.0, "filter": "box\t\t\tBox", "fringe": False, "inject": False, "invertMask": False, "maskChannelInput": "none", "mix": 1.0, "projection": "latlong", "quality": 15.0, "repeatEdgePixels": True, "size": 1.0, "useGPUIfAvailable": True},
    "Deblur": {"fringe": False, "halfPrecision": False, "inject": False, "invert_mask": False, "isFirstTime": False, "maskChannelInput": "none", "maskChannelMask": "alpha", "maskFromFlag": False, "mix": 1.0, "tileOverlap": 64.0, "tileSize": "None", "useGPUIfAvailable": True},
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
