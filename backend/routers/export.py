from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
from database import get_db
import models, schemas
from services.docx_builder import build_docx

router = APIRouter()

@router.get("/{report_id}")
def export_report(report_id: int, db: Session = Depends(get_db)):
    r = db.get(models.Report, report_id)
    if not r:
        raise HTTPException(404)

    # Preserve the order in which operators were checked.
    operator_ids = json.loads(r.operators or "[]")
    doctors_by_id = {
        d.id: d for d in db.query(models.Doctor).filter(models.Doctor.id.in_(operator_ids)).all()
    }
    doctor_names = [doctors_by_id[i].name for i in operator_ids if i in doctors_by_id]

    full = schemas.FullReport(
        report=r,
        clinical=db.query(models.ClinicalStatus).filter_by(report_id=report_id).first(),
        technique=db.query(models.Technique).filter_by(report_id=report_id).first(),
        lesions=db.query(models.Lesion).filter_by(report_id=report_id).order_by(models.Lesion.position).all(),
        conclusion=db.query(models.Conclusion).filter_by(report_id=report_id).first(),
        interventions=db.query(models.Intervention).filter_by(report_id=report_id).order_by(models.Intervention.position).all(),
    )
    full_dict = full.model_dump()
    full_dict["doctor_names"] = doctor_names

    buf = build_docx(full_dict)
    name = (r.patient_name or "PATIENT").upper().replace(" ", "_")
    date = (r.exam_date or "").replace("-", "_")
    filename = f"Coro_{name}_{date}.docx"

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
