import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_options(db: Session = Depends(get_db)):
    rows = db.query(models.OptionStore).all()
    return {r.key: json.loads(r.value) for r in rows}

@router.put("/{key}")
def update_option_list(key: str, items: list, db: Session = Depends(get_db)):
    obj = db.get(models.OptionStore, key)
    if not obj:
        raise HTTPException(404, f"Option key '{key}' not found")
    obj.value = json.dumps(items, ensure_ascii=False)
    db.commit()
    return json.loads(obj.value)
