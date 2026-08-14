r"""Run reviewed audit batches on request inside an already-open Nuke session.

Start once from Nuke's Script Editor:
    import runpy
    runpy.run_path(r"C:\path\to\tools\nuke_audit_worker.py")

The worker only executes ``nuke_batch_audit.py`` from this directory. It does
not accept a script path or arbitrary Python from the request file.
"""

import json
import os
import runpy
import traceback

try:
    from PySide6 import QtCore
except ImportError:
    from PySide2 import QtCore


TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIT_SCRIPT = os.path.join(TOOLS_DIR, "nuke_batch_audit.py")
REQUEST_PATH = os.path.join(TOOLS_DIR, "audit-request.json")
STATUS_PATH = os.path.join(TOOLS_DIR, "audit-worker-status.json")
POLL_INTERVAL_MS = 1000

_timer = globals().get("_timer")
_busy = False
_last_request_id = None


def _write_json(path, payload):
    temporary = path + ".tmp"
    with open(temporary, "w", encoding="utf-8") as stream:
        json.dump(payload, stream, indent=2, sort_keys=True)
    os.replace(temporary, path)


def _read_request():
    if not os.path.exists(REQUEST_PATH):
        return None
    with open(REQUEST_PATH, encoding="utf-8") as stream:
        request = json.load(stream)
    if not isinstance(request, dict):
        raise ValueError("audit request must be a JSON object")
    return request


def _poll():
    global _busy, _last_request_id
    if _busy:
        return

    try:
        request = _read_request()
    except Exception:
        _write_json(STATUS_PATH, {
            "state": "request-error",
            "error": traceback.format_exc(),
        })
        return

    if not request or request.get("state") != "pending":
        return

    request_id = request.get("request_id")
    if not request_id or request_id == _last_request_id:
        return

    _busy = True
    _last_request_id = request_id
    _write_json(STATUS_PATH, {"request_id": request_id, "state": "running"})
    print("\nNuke audit worker: running request {}".format(request_id))

    try:
        runpy.run_path(AUDIT_SCRIPT, run_name="__nuke_audit_batch__")
        _write_json(STATUS_PATH, {"request_id": request_id, "state": "complete"})
        print("Nuke audit worker: request {} complete".format(request_id))
    except Exception:
        error = traceback.format_exc()
        _write_json(STATUS_PATH, {
            "request_id": request_id,
            "state": "error",
            "error": error,
        })
        print("Nuke audit worker: request {} failed\n{}".format(request_id, error))
    finally:
        _busy = False


def start():
    global _timer
    if _timer is not None:
        try:
            _timer.stop()
            _timer.deleteLater()
        except RuntimeError:
            pass
    _timer = QtCore.QTimer()
    _timer.setInterval(POLL_INTERVAL_MS)
    _timer.timeout.connect(_poll)
    _timer.start()
    _write_json(STATUS_PATH, {"state": "waiting"})
    print("Nuke audit worker is waiting for reviewed batches.")
    print("Request file: {}".format(REQUEST_PATH))


def stop():
    global _timer
    if _timer is not None:
        _timer.stop()
        _timer.deleteLater()
        _timer = None
    _write_json(STATUS_PATH, {"state": "stopped"})
    print("Nuke audit worker stopped.")


start()
