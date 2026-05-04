from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from database import Base

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    active = Column(Boolean, default=True)

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, default="coro")
    patient_name = Column(String, default="")
    dob = Column(String, default="")
    sex = Column(String, default="Masculin")
    ipp = Column(String, default="")
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    exam_date = Column(String, default="")
    operators = Column(Text, default="[]")
    indication = Column(Text, default="")
    created_at = Column(String, default="")
    updated_at = Column(String, default="")

class ClinicalStatus(Base):
    __tablename__ = "clinical_status"
    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    age = Column(Integer, nullable=True)
    fdrcx = Column(Text, default="[]")
    fdrcx_notes = Column(Text, default="")
    atcd = Column(Text, default="")
    hm = Column(Text, default="")
    ecg = Column(Text, default="")
    ett_fevg = Column(Float, nullable=True)
    ett_notes = Column(Text, default="")

class Technique(Base):
    __tablename__ = "technique"
    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    room = Column(String, default="GE Innova")
    approach = Column(String, default="Artère radiale droite")
    french_size = Column(Integer, default=6)
    contrast_cc = Column(Integer, nullable=True)
    dose_mgy = Column(Integer, nullable=True)
    material = Column(Text, default="[]")

class Lesion(Base):
    __tablename__ = "lesions"
    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    artery = Column(String, nullable=False)
    stenosis_pct = Column(String, default="50-70")
    timi = Column(Integer, default=3)
    good_distal_bed = Column(Boolean, default=True)
    notes = Column(Text, default="")
    position = Column(Integer, default=0)

class Conclusion(Base):
    __tablename__ = "conclusion"
    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    trunk_disease = Column(String, default="normal")
    decision = Column(String, default="")
    decision_notes = Column(Text, default="")
