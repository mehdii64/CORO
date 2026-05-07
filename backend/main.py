import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import Base, engine, SessionLocal
from routers import doctors, reports, options, export
import models

Base.metadata.create_all(bind=engine)


def _ensure_column(table: str, column: str, ddl: str) -> None:
    with engine.connect() as conn:
        cols = [r[1] for r in conn.execute(text(f"PRAGMA table_info({table})")).fetchall()]
        if column not in cols:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}"))
            conn.commit()


_ensure_column("clinical_status", "ett_kinetics", "TEXT DEFAULT ''")
_ensure_column("lesions", "occlusion_type", "VARCHAR DEFAULT ''")


# Seed default doctors on startup if missing
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
_db = SessionLocal()
try:
    for _name in DEFAULT_DOCTORS:
        if not _db.query(models.Doctor).filter_by(name=_name).first():
            _db.add(models.Doctor(name=_name, active=True))
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
