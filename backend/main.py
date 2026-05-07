import os
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, SessionLocal
from routers import doctors, reports, options, export
import models

Base.metadata.create_all(bind=engine)

DEFAULT_DOCTORS = [
    "Dr Najlaa Belharty",
    "Pr Fennich Nada",
    "Pr Tanae El Ghali",
    "Pr Oukerraj Latifa",
    "Dr Hassani Asmae",
    "Dr El Hajjaj Belghait",
    "Dr Louafi Mohammed Elmehdi",
    "Dr Laarousi Mehdi",
    "Dr Zaki Ayoub",
    "Dr Amjad Arbaoui",
    "Dr Idriss Haddioui",
    "Dr Allalat Idriss",
]

_OPTIONS_FILE = Path(__file__).parent / "data" / "options.json"

_db = SessionLocal()
try:
    for _name in DEFAULT_DOCTORS:
        if not _db.query(models.Doctor).filter_by(name=_name).first():
            _db.add(models.Doctor(name=_name, active=True))

    _default_opts = json.loads(_OPTIONS_FILE.read_text(encoding="utf-8"))
    for _key, _val in _default_opts.items():
        if not _db.get(models.OptionStore, _key):
            _db.add(models.OptionStore(key=_key, value=json.dumps(_val, ensure_ascii=False)))

    _db.commit()
finally:
    _db.close()

app = FastAPI(title="Coro Report API")

_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(doctors.router, prefix="/api/doctors", tags=["doctors"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(options.router, prefix="/api/options", tags=["options"])
app.include_router(export.router, prefix="/api/export", tags=["export"])

@app.get("/api/health")
def health():
    return {"status": "ok"}
