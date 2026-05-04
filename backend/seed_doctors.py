"""Run once to pre-populate the service doctors."""
from database import SessionLocal, engine, Base
import models

Base.metadata.create_all(bind=engine)

DOCTORS = [
    "Dr NAJLAA BELHARTY",
    "Dr HAJJAJ BELGHAIT",
    "Dr EL MEHDI EL HADDIOUI",
    "Dr IDRISS ALLALAT",
    "Dr MEHDI AYOUB LAAROUSSI",
]

db = SessionLocal()
added = 0
for name in DOCTORS:
    if not db.query(models.Doctor).filter_by(name=name).first():
        db.add(models.Doctor(name=name, active=True))
        added += 1
db.commit()
db.close()
print(f"{added} médecin(s) ajouté(s).")
