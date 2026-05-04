from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import doctors, reports, options

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coro Report API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(doctors.router, prefix="/api/doctors", tags=["doctors"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(options.router, prefix="/api/options", tags=["options"])

@app.get("/api/health")
def health():
    return {"status": "ok"}
