from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/", response_model=list[schemas.DoctorOut])
def list_doctors(db: Session = Depends(get_db)):
    return db.query(models.Doctor).all()

@router.post("/", response_model=schemas.DoctorOut, status_code=201)
def create_doctor(body: schemas.DoctorCreate, db: Session = Depends(get_db)):
    doc = models.Doctor(**body.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.put("/{doctor_id}", response_model=schemas.DoctorOut)
def update_doctor(doctor_id: int, body: schemas.DoctorCreate, db: Session = Depends(get_db)):
    doc = db.get(models.Doctor, doctor_id)
    if not doc:
        raise HTTPException(404, "Doctor not found")
    for k, v in body.model_dump().items():
        setattr(doc, k, v)
    db.commit()
    db.refresh(doc)
    return doc
