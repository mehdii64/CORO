from pydantic import BaseModel
from typing import Optional

class DoctorCreate(BaseModel):
    name: str
    active: bool = True

class DoctorOut(DoctorCreate):
    id: int
    model_config = {"from_attributes": True}

class ReportCreate(BaseModel):
    type: str = "coro"
    patient_name: str = ""
    dob: str = ""
    sex: str = "Masculin"
    ipp: str = ""
    height: Optional[float] = None
    weight: Optional[float] = None
    exam_date: str = ""
    operators: str = "[]"
    indication: str = ""

class ReportOut(ReportCreate):
    id: int
    created_at: str = ""
    updated_at: str = ""
    model_config = {"from_attributes": True}

class ClinicalStatusCreate(BaseModel):
    age: Optional[int] = None
    fdrcx: str = "[]"
    fdrcx_notes: str = ""
    atcd: str = ""
    hm: str = ""
    ecg: str = ""
    ett_fevg: Optional[float] = None
    ett_notes: str = ""

class ClinicalStatusOut(ClinicalStatusCreate):
    id: int
    report_id: int
    model_config = {"from_attributes": True}

class TechniqueCreate(BaseModel):
    room: str = "GE Innova"
    approach: str = "Artère radiale droite"
    french_size: int = 6
    contrast_cc: Optional[int] = None
    dose_mgy: Optional[int] = None
    material: str = "[]"

class TechniqueOut(TechniqueCreate):
    id: int
    report_id: int
    model_config = {"from_attributes": True}

class LesionCreate(BaseModel):
    artery: str
    stenosis_pct: str = "50-70"
    timi: int = 3
    good_distal_bed: bool = True
    notes: str = ""
    position: int = 0

class LesionOut(LesionCreate):
    id: int
    report_id: int
    model_config = {"from_attributes": True}

class ConclusionCreate(BaseModel):
    trunk_disease: str = "normal"
    decision: str = ""
    decision_notes: str = ""

class ConclusionOut(ConclusionCreate):
    id: int
    report_id: int
    model_config = {"from_attributes": True}

class FullReport(BaseModel):
    report: ReportOut
    clinical: Optional[ClinicalStatusOut] = None
    technique: Optional[TechniqueOut] = None
    lesions: list[LesionOut] = []
    conclusion: Optional[ConclusionOut] = None
