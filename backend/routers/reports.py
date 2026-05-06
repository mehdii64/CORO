from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from database import get_db
import models, schemas

router = APIRouter()

def _now():
    return datetime.now(timezone.utc).isoformat()

@router.get("/", response_model=list[schemas.ReportOut])
def list_reports(db: Session = Depends(get_db)):
    return db.query(models.Report).order_by(models.Report.exam_date.desc()).all()

@router.post("/", response_model=schemas.ReportOut, status_code=201)
def create_report(body: schemas.ReportCreate, db: Session = Depends(get_db)):
    now = _now()
    r = models.Report(**body.model_dump(), created_at=now, updated_at=now)
    db.add(r)
    db.commit()
    db.refresh(r)
    db.add(models.ClinicalStatus(report_id=r.id))
    db.add(models.Technique(report_id=r.id))
    db.add(models.Conclusion(report_id=r.id))
    db.commit()
    return r

@router.get("/{report_id}", response_model=schemas.FullReport)
def get_report(report_id: int, db: Session = Depends(get_db)):
    r = db.get(models.Report, report_id)
    if not r:
        raise HTTPException(404)
    return schemas.FullReport(
        report=r,
        clinical=db.query(models.ClinicalStatus).filter_by(report_id=report_id).first(),
        technique=db.query(models.Technique).filter_by(report_id=report_id).first(),
        lesions=db.query(models.Lesion).filter_by(report_id=report_id).order_by(models.Lesion.position).all(),
        conclusion=db.query(models.Conclusion).filter_by(report_id=report_id).first(),
        interventions=db.query(models.Intervention).filter_by(report_id=report_id).order_by(models.Intervention.position).all(),
    )

@router.put("/{report_id}", response_model=schemas.ReportOut)
def update_report(report_id: int, body: schemas.ReportCreate, db: Session = Depends(get_db)):
    r = db.get(models.Report, report_id)
    if not r:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(r, k, v)
    r.updated_at = _now()
    db.commit()
    db.refresh(r)
    return r

@router.delete("/{report_id}", status_code=204)
def delete_report(report_id: int, db: Session = Depends(get_db)):
    r = db.get(models.Report, report_id)
    if not r:
        raise HTTPException(404)
    db.delete(r)
    db.commit()

@router.put("/{report_id}/clinical", response_model=schemas.ClinicalStatusOut)
def update_clinical(report_id: int, body: schemas.ClinicalStatusCreate, db: Session = Depends(get_db)):
    obj = db.query(models.ClinicalStatus).filter_by(report_id=report_id).first()
    if not obj:
        obj = models.ClinicalStatus(report_id=report_id)
        db.add(obj)
    for k, v in body.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{report_id}/technique", response_model=schemas.TechniqueOut)
def update_technique(report_id: int, body: schemas.TechniqueCreate, db: Session = Depends(get_db)):
    obj = db.query(models.Technique).filter_by(report_id=report_id).first()
    if not obj:
        obj = models.Technique(report_id=report_id)
        db.add(obj)
    for k, v in body.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{report_id}/conclusion", response_model=schemas.ConclusionOut)
def update_conclusion(report_id: int, body: schemas.ConclusionCreate, db: Session = Depends(get_db)):
    obj = db.query(models.Conclusion).filter_by(report_id=report_id).first()
    if not obj:
        obj = models.Conclusion(report_id=report_id)
        db.add(obj)
    for k, v in body.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.post("/{report_id}/lesions", response_model=schemas.LesionOut, status_code=201)
def add_lesion(report_id: int, body: schemas.LesionCreate, db: Session = Depends(get_db)):
    l = models.Lesion(report_id=report_id, **body.model_dump())
    db.add(l)
    db.commit()
    db.refresh(l)
    return l

@router.put("/{report_id}/lesions/{lesion_id}", response_model=schemas.LesionOut)
def update_lesion(report_id: int, lesion_id: int, body: schemas.LesionCreate, db: Session = Depends(get_db)):
    l = db.get(models.Lesion, lesion_id)
    if not l or l.report_id != report_id:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(l, k, v)
    db.commit()
    db.refresh(l)
    return l

@router.delete("/{report_id}/lesions/{lesion_id}", status_code=204)
def delete_lesion(report_id: int, lesion_id: int, db: Session = Depends(get_db)):
    l = db.get(models.Lesion, lesion_id)
    if not l or l.report_id != report_id:
        raise HTTPException(404)
    db.delete(l)
    db.commit()


# ----- ATC Interventions -----

@router.post("/{report_id}/interventions", response_model=schemas.InterventionOut, status_code=201)
def add_intervention(report_id: int, body: schemas.InterventionCreate, db: Session = Depends(get_db)):
    iv = models.Intervention(report_id=report_id, **body.model_dump())
    db.add(iv)
    db.commit()
    db.refresh(iv)
    return iv

@router.put("/{report_id}/interventions/{iv_id}", response_model=schemas.InterventionOut)
def update_intervention(report_id: int, iv_id: int, body: schemas.InterventionCreate, db: Session = Depends(get_db)):
    iv = db.get(models.Intervention, iv_id)
    if not iv or iv.report_id != report_id:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(iv, k, v)
    db.commit()
    db.refresh(iv)
    return iv

@router.delete("/{report_id}/interventions/{iv_id}", status_code=204)
def delete_intervention(report_id: int, iv_id: int, db: Session = Depends(get_db)):
    iv = db.get(models.Intervention, iv_id)
    if not iv or iv.report_id != report_id:
        raise HTTPException(404)
    db.delete(iv)
    db.commit()
