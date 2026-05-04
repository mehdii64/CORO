"""
Generates text for each section of a coronarography report.
Principle: all constant text (normal anatomy, connections) is hardcoded;
the user only inputs anomalies (lesions, calcifications, infiltrations).
"""
from __future__ import annotations

QUALIFIERS = {
    "50-70": "significative",
    "70-90": "serrée",
    "90-99": "très serrée",
    "100": "totalement occluse (CTO)",
}

def _timi(n: int) -> str:
    labels = {0: "TIMI 0", 1: "TIMI I", 2: "TIMI II", 3: "TIMI III"}
    return labels.get(n, f"TIMI {n}")

def _distal(good: bool) -> str:
    return "un bon lit d'aval" if good else "un lit d'aval altéré"

def _lesion_phrase(segment_label: str, stenosis_pct: str, timi: int,
                   good_distal_bed: bool, notes: str) -> str:
    qual = QUALIFIERS.get(stenosis_pct, "significative")
    notes_str = f" ({notes})" if notes.strip() else ""
    return (
        f"{segment_label} présente une lésion {qual}{notes_str} "
        f"({stenosis_pct}%) avec un flux coronaire antérograde "
        f"{_timi(timi)} et {_distal(good_distal_bed)}."
    )


def build_tcg(lesions: list[dict]) -> str:
    base = (
        "Le tronc commun se connecte au sinus antéro-gauche, "
        "il est de calibre normal. "
        "Il se bifurque en réseau IVA-diagonale et réseau CX-marginale."
    )
    tcg_lesions = [l for l in lesions if l["artery"] == "TCG"]
    if not tcg_lesions:
        return base
    lesion_sentences = " ".join(
        _lesion_phrase("Il", l["stenosis_pct"], l["timi"], l["good_distal_bed"], l["notes"])
        for l in tcg_lesions
    )
    return base.rstrip(".") + ". " + lesion_sentences


def build_iva(lesions: list[dict], n_diag: int = 1,
              calcified: bool = False, infiltrated: bool = False) -> str:
    calcif_str = ", calcifiée dans sa partie proximale" if calcified else ""
    infilt_str = ", infiltrée sur toute sa longueur" if infiltrated else ""
    diag_str = (
        f"Elle donne naissance à {n_diag} branche(s) diagonale(s) "
        "et quelques branches septales."
    )
    base = (
        f"L'artère interventriculaire antérieure est de calibre normal"
        f"{calcif_str}{infilt_str}, elle fait la pointe du cœur. "
        f"{diag_str}"
    )
    iva_lesions = [l for l in lesions if l["artery"].startswith("IVA")]
    if not iva_lesions:
        return base

    SEGMENT_LABELS = {
        "IVA_prox": "L'IVA proximale",
        "IVA_moy":  "L'IVA moyenne",
        "IVA_dist": "L'IVA distale",
    }
    lesion_sentences = " ".join(
        _lesion_phrase(
            SEGMENT_LABELS.get(l["artery"], l["artery"]),
            l["stenosis_pct"], l["timi"], l["good_distal_bed"], l["notes"]
        )
        for l in iva_lesions
    )
    return base + " " + lesion_sentences


def build_cx(lesions: list[dict], n_marginales: int = 1) -> str:
    marg_str = (
        f"elle donne naissance à {n_marginales} branche(s) marginale(s) principale(s)."
    )
    base = f"L'artère circonflexe est de calibre normal, {marg_str}"
    cx_lesions = [
        l for l in lesions
        if l["artery"].startswith("CX") or l["artery"].startswith("M")
    ]
    if not cx_lesions:
        return base

    SEGMENT_LABELS = {
        "CX_prox": "La Cx proximale",
        "CX_dist": "La Cx distale",
        "M1_prox": "La marginale (partie proximale)",
        "M1_dist": "La marginale (partie distale)",
        "M2":      "La deuxième marginale",
    }
    lesion_sentences = " ".join(
        _lesion_phrase(
            SEGMENT_LABELS.get(l["artery"], l["artery"]),
            l["stenosis_pct"], l["timi"], l["good_distal_bed"], l["notes"]
        )
        for l in cx_lesions
    )
    return base + " " + lesion_sentences


def build_acd(lesions: list[dict], dominance: str = "droite") -> str:
    base = (
        "L'artère coronaire droite se connecte au sinus antéro-droit, "
        "de calibre normal."
    )
    acd_lesions = [
        l for l in lesions
        if l["artery"].startswith("CD") or l["artery"] in ("IVP", "RVP")
    ]
    if not acd_lesions:
        return base

    SEGMENT_LABELS = {
        "CD1": "La CD (genou supérieur)",
        "CD2": "La CD2 (genou inférieur)",
        "CD3": "La CD distale",
        "IVP": "L'artère IVP (partie proximale)",
        "RVP": "L'artère RVP (partie proximale)",
    }
    lesion_sentences = " ".join(
        _lesion_phrase(
            SEGMENT_LABELS.get(l["artery"], l["artery"]),
            l["stenosis_pct"], l["timi"], l["good_distal_bed"], l["notes"]
        )
        for l in acd_lesions
    )
    return base + " " + lesion_sentences


TRUNK_LABELS = {
    "normal":  "Artères coronaires sans lésions significatives.",
    "mono":    "Lésions mono-tronculaires.",
    "bi":      "Lésions bi-tronculaires.",
    "tri":     "Lésions tri-tronculaires.",
    "tronc":   "Lésion du tronc commun gauche.",
}

def build_conclusion_lines(lesions: list[dict], trunk_disease: str) -> list[str]:
    lines = [TRUNK_LABELS.get(trunk_disease, trunk_disease)]
    for l in lesions:
        qual = QUALIFIERS.get(l["stenosis_pct"], "significative")
        notes_str = f" ({l['notes']})" if l["notes"].strip() else ""
        lines.append(
            f"Lésion {qual}{notes_str} ({l['stenosis_pct']}%) — {l['artery']} — "
            f"flux {_timi(l['timi'])}, {_distal(l['good_distal_bed'])}."
        )
    return lines


def build_full_coro_text(full_report: dict) -> dict:
    """
    Takes a serialized FullReport dict and returns text paragraphs per section.
    """
    lesions = full_report.get("lesions", [])
    dominance = full_report.get("dominance", "droite")

    return {
        "tcg":  build_tcg(lesions),
        "iva":  build_iva(lesions),
        "cx":   build_cx(lesions),
        "acd":  build_acd(lesions, dominance),
        "conclusion_lines": build_conclusion_lines(
            lesions,
            (full_report.get("conclusion") or {}).get("trunk_disease", "normal")
        ),
    }
