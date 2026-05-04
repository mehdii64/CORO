import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()
OPTIONS_PATH = Path(__file__).parent.parent.parent / "data" / "options.json"

@router.get("/")
def get_options():
    return json.loads(OPTIONS_PATH.read_text(encoding="utf-8"))

@router.put("/{key}")
def update_option_list(key: str, items: list[str]):
    opts = json.loads(OPTIONS_PATH.read_text(encoding="utf-8"))
    if key not in opts:
        raise HTTPException(404, f"Option key '{key}' not found")
    opts[key] = items
    OPTIONS_PATH.write_text(json.dumps(opts, ensure_ascii=False, indent=2), encoding="utf-8")
    return opts
