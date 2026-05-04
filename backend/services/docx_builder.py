"""
Fills BACK UP M.docx template with FullReport data and returns BytesIO.
The template uses {{TOKEN}} placeholders that will be replaced in Task 10.
Until Task 10 is done (manual tokenization of the Word file), this builder
works but tokens won't be substituted visually — the text replacement is ready.
"""
from __future__ import annotations
import io, json
from pathlib import Path
from docx import Document
from services.phrase_builder import build_full_coro_text

TEMPLATE_PATH = Path(__file__).parent.parent.parent / "templates" / "BACK UP M.docx"

def _s(value, default="") -> str:
    return str(value) if value is not None else default

def _format_fdrcx(clinical: dict) -> str:
    items = json.loads(clinical.get("fdrcx", "[]") or "[]")
    notes = clinical.get("fdrcx_notes", "") or ""
    result = ", ".join(items)
    if notes:
        result += f" — {notes}"
    return result

def _format_ett(clinical: dict) -> str:
    fevg = clinical.get("ett_fevg")
    notes = clinical.get("ett_notes", "") or ""
    parts = []
    if fevg:
        parts.append(f"FEVG {fevg}%")
    if notes:
        parts.append(notes)
    return " — ".join(parts) if parts else "VG de cinétique normale"

def _format_material(technique: dict) -> str:
    items = json.loads(technique.get("material", "[]") or "[]")
    return "\n".join(f"  {item}" for item in items)

def build_docx(full_report: dict) -> io.BytesIO:
    doc = Document(TEMPLATE_PATH)
    report   = full_report.get("report") or {}
    clinical = full_report.get("clinical") or {}
    technique= full_report.get("technique") or {}
    conclusion=full_report.get("conclusion") or {}

    texts = build_full_coro_text(full_report)

    doctor_names = full_report.get("doctor_names", [])

    replacements = {
        "{{PATIENT_NAME}}":   _s(report.get("patient_name")),
        "{{DOB}}":            _s(report.get("dob")),
        "{{SEX}}":            _s(report.get("sex")),
        "{{IPP}}":            _s(report.get("ipp")),
        "{{HEIGHT}}":         _s(report.get("height")),
        "{{WEIGHT}}":         _s(report.get("weight")),
        "{{EXAM_DATE}}":      _s(report.get("exam_date")),
        "{{INDICATION}}":     _s(report.get("indication")),
        "{{OPERATORS}}":      ", ".join(doctor_names),
        "{{AGE}}":            _s(clinical.get("age")),
        "{{FDRCX}}":          _format_fdrcx(clinical),
        "{{ATCD}}":           _s(clinical.get("atcd")),
        "{{HM}}":             _s(clinical.get("hm")),
        "{{ECG}}":            _s(clinical.get("ecg")),
        "{{ETT}}":            _format_ett(clinical),
        "{{ROOM}}":           _s(technique.get("room")),
        "{{APPROACH}}":       _s(technique.get("approach")),
        "{{FRENCH}}":         _s(technique.get("french_size")),
        "{{PDC}}":            _s(technique.get("contrast_cc")),
        "{{DOSE}}":           _s(technique.get("dose_mgy")),
        "{{MATERIAL}}":       _format_material(technique),
        "{{CORO_TCG}}":       texts["tcg"],
        "{{CORO_IVA}}":       texts["iva"],
        "{{CORO_CX}}":        texts["cx"],
        "{{CORO_ACD}}":       texts["acd"],
        "{{CONCLUSION}}":     "\n".join(texts["conclusion_lines"]),
        "{{DECISION}}":       _s(conclusion.get("decision")),
        "{{DECISION_NOTES}}": _s(conclusion.get("decision_notes")),
    }

    def replace_in_para(para):
        for run in para.runs:
            for token, value in replacements.items():
                if token in run.text:
                    run.text = run.text.replace(token, value)

    for para in doc.paragraphs:
        replace_in_para(para)

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    replace_in_para(para)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf
