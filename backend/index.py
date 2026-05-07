import os
import traceback
from fastapi import FastAPI

debug_app = FastAPI()
_import_error = None

try:
    from main import app
except Exception:
    _import_error = traceback.format_exc()
    app = debug_app

@debug_app.get("/api/debug")
def debug():
    return {
        "error": _import_error,
        "cwd": os.getcwd(),
        "files": os.listdir("."),
        "tmp": os.listdir("/tmp") if os.path.exists("/tmp") else "no /tmp",
    }
