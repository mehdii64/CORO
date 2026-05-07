import os
import traceback
from fastapi import FastAPI

app = FastAPI()  # top-level so Vercel's static analysis finds it
_import_error = None

try:
    import main as _main
    app = _main.app
except Exception:
    _import_error = traceback.format_exc()

@app.get("/api/debug")
def debug():
    return {
        "error": _import_error,
        "cwd": os.getcwd(),
        "files": os.listdir("."),
        "env_db": os.getenv("DATABASE_URL", "not set"),
    }
