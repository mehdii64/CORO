"""
Generates text for each section of a coronarography report.
Principle: all constant text (normal anatomy, connections) is hardcoded;
the user only inputs anomalies (lesions, calcifications, infiltrations).
"""
from __future__ import annotations

# Stenosis qualifiers per the user-provided rule:
#   50-70 → intermédiaire
#   70-90 → serrée
#   90-99 → sub-occlusive
#   100   → occlusion (handled separately)
QUALIFIERS = {
    "50-70": "intermédiaire",
    "70-90": "serrée",
    "90-99": "sub-occlusive",
}


def _timi(n: int) -> str:
    labels = {0: "TIMI 0", 1: "TIMI I", 2: "TIMI II", 3: "TIMI III"}
    return labels.get(n, f"TIMI {n}")


import re as _re

_PRESSURE_RE = _re.compile(
    r"^\s*(\d+(?:[.,]\d+)?)\s*(?:ATM|atm)\s*(?:x|×|\*)?\s*(\d+)?\s*(?:sec|s|secondes?)?\s*$"
)


def _format_pressure(raw: str, kind: str = "nominale") -> str:
    """Render a pressure expression in the service's house style.

    Accepts compact inputs like '8 ATM x 20 sec' and reformats them to
    'une pression {kind} de 8 ATM, pendant 20 secondes'. If the input is
    already long-form or doesn't match the pattern, returns it verbatim.
    """
    s = (raw or "").strip()
    if not s:
        return f"une pression {kind} de 8 ATM, pendant 10 secondes"
    if "pression" in s.lower():
        return s
    m = _PRESSURE_RE.match(s)
    if not m:
        return s
    atm = m.group(1).replace(",", ".")
    sec = m.group(2)
    if sec:
        return f"une pression {kind} de {atm} ATM, pendant {sec} secondes"
    return f"une pression {kind} de {atm} ATM"


def _occlusion_phrase(segment_label: str, lesion: dict) -> str:
    """Phrase for a 100% lesion. Differentiates acute (thrombotic) vs chronic (CTO)."""
    occl_type = (lesion.get("occlusion_type") or "").strip().lower()
    notes = (lesion.get("notes") or "").strip()
    notes_str = f" ({notes})" if notes else ""

    if occl_type == "chronique":
        descriptor = "occlusion chronique (CTO)"
    elif occl_type == "aigue":
        descriptor = "occlusion thrombotique aiguë"
    else:
        descriptor = "occlusion"

    return (
        f"{segment_label} présente une {descriptor}{notes_str} "
        f"sans flux coronaire antérograde (TIMI 0)."
    )


def _lesion_phrase(segment_label: str, lesion: dict) -> str:
    if str(lesion.get("stenosis_pct")) == "100":
        return _occlusion_phrase(segment_label, lesion)
    qual = QUALIFIERS.get(lesion.get("stenosis_pct"), "significative")
    notes = (lesion.get("notes") or "").strip()
    notes_str = f" ({notes})" if notes else ""
    pct = lesion.get("stenosis_pct")
    return (
        f"{segment_label} présente une lésion {qual}{notes_str} "
        f"({pct}%) avec un flux coronaire antérograde "
        f"{_timi(lesion.get('timi', 3))}."
    )


def _branche(label_singular: str, n: int) -> str:
    """Return e.g. '1 branche diagonale' or '2 branches diagonales'."""
    if n <= 1:
        return f"{n} {label_singular}"
    plural = " ".join(w if w.endswith("s") else w + "s" for w in label_singular.split())
    return f"{n} {plural}"


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
        _lesion_phrase("Il", l) for l in tcg_lesions
    )
    return base.rstrip(".") + ". " + lesion_sentences


def build_iva(lesions: list[dict], n_diag: int = 1,
              calcified: bool = False, infiltrated: bool = False) -> str:
    calcif_str = ", calcifiée dans sa partie proximale" if calcified else ""
    infilt_str = ", infiltrée sur toute sa longueur" if infiltrated else ""
    diag_str = (
        f"Elle donne naissance à {_branche('branche diagonale', n_diag)} "
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
        _lesion_phrase(SEGMENT_LABELS.get(l["artery"], l["artery"]), l)
        for l in iva_lesions
    )
    return base + " " + lesion_sentences


def build_cx(lesions: list[dict], n_marginales: int = 1) -> str:
    marg_str = (
        f"elle donne naissance à {_branche('branche marginale principale', n_marginales)}."
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
        _lesion_phrase(SEGMENT_LABELS.get(l["artery"], l["artery"]), l)
        for l in cx_lesions
    )
    return base + " " + lesion_sentences


def build_acd(lesions: list[dict], dominance: str = "droite") -> str:  # noqa: ARG001
    """Return the ACD section as a single paragraph (mirrors LCA paragraphs)."""
    acd_lesions = [
        l for l in lesions
        if l["artery"].startswith("CD") or l["artery"] in ("IVP", "RVP")
    ]
    if not acd_lesions:
        return (
            "L'artère coronaire droite se connecte au sinus antéro-droit, "
            "elle est de calibre normal, et indemne de lésion significative."
        )
    base = "L'artère coronaire droite se connecte au sinus antéro-droit, de calibre normal."

    SEGMENT_LABELS = {
        "CD1": "La CD I (genou supérieur)",
        "CD2": "La CD II (genou inférieur)",
        "CD3": "La CD III (CD distale)",
        "IVP": "L'artère IVP",
        "RVP": "L'artère RVP",
    }
    lesion_sentences = " ".join(
        _lesion_phrase(SEGMENT_LABELS.get(l["artery"], l["artery"]), l)
        for l in acd_lesions
    )
    return base + " " + lesion_sentences


def build_conclusion_lines(lesions: list[dict]) -> list[str]:
    """Return per-lesion conclusion lines (no global atteinte type)."""
    if not lesions:
        return ["Artères coronaires sans lésions significatives."]
    lines: list[str] = []
    for l in lesions:
        pct = l.get("stenosis_pct")
        notes = (l.get("notes") or "").strip()
        notes_str = f" ({notes})" if notes else ""
        if str(pct) == "100":
            occl_type = (l.get("occlusion_type") or "").strip().lower()
            if occl_type == "chronique":
                descriptor = "Occlusion chronique (CTO)"
            elif occl_type == "aigue":
                descriptor = "Occlusion thrombotique aiguë"
            else:
                descriptor = "Occlusion"
            lines.append(
                f"{descriptor}{notes_str} — {l['artery']} — sans flux coronaire antérograde (TIMI 0)."
            )
        else:
            qual = QUALIFIERS.get(pct, "significative")
            lines.append(
                f"Lésion {qual}{notes_str} ({pct}%) — {l['artery']} — "
                f"flux {_timi(l.get('timi', 3))}."
            )
    return lines


def _parse_json_list(value) -> list:
    if isinstance(value, list):
        return value
    if not value:
        return []
    import json as _json
    try:
        return _json.loads(value)
    except Exception:
        return []


def _stent_phrase(stent: dict) -> str:
    """Format a single stent dict into a French phrase."""
    parts = []
    name = (stent.get("name") or "").strip()
    diameter = stent.get("diameter") or ""
    length = stent.get("length") or ""
    manufacturer = (stent.get("manufacturer") or "").strip()
    pressure = (stent.get("pressure") or "").strip()
    stent_type = (stent.get("type") or "actif").strip() or "actif"

    label = f"un stent {stent_type}"
    if name:
        label += f" {name}"
    if diameter and length:
        label += f" {diameter} x {length} mm"
    if manufacturer:
        label += f" ({manufacturer})"
    parts.append(label)
    if pressure:
        parts.append(f"déployé à {pressure}")
    return ", ".join(parts)


def _stent_full_desc(stent: dict) -> str:
    """Format a stent as 'NAME D x L mm (manufacturer)' for narrative/conclusion lines."""
    name = (stent.get("name") or "").strip()
    d = stent.get("diameter") or ""
    l = stent.get("length") or ""
    mfr = (stent.get("manufacturer") or "").strip()
    label = name
    if d and l:
        label = f"{label} {d} x {l} mm".strip()
    if mfr:
        label += f" ({mfr})"
    return label.strip()


def build_atc_intervention(intervention: dict) -> list[str]:
    """Return a list of bullet sentences describing one ATC intervention."""
    artery = intervention.get("artery") or "l'artère cible"
    guide = (intervention.get("guide_catheter") or "").strip()
    wires = _parse_json_list(intervention.get("wires"))
    stents = _parse_json_list(intervention.get("stents"))

    bullets: list[str] = []

    if guide:
        bullets.append(f"La sonde porteuse {guide} est positionnée au niveau de {artery}.")

    if wires:
        bullets.append(
            f"Mise en place d'un guide {wires[0]} qui franchit facilement la lésion et s'y met en distalité."
        )
        for i, w in enumerate(wires[1:], start=2):
            ord_label = {2: "deuxième", 3: "troisième", 4: "quatrième"}.get(i, f"{i}ème")
            bullets.append(f"Mise en place d'un {ord_label} guide {w}.")

    if intervention.get("predilation"):
        balloon = intervention.get("predilation_balloon") or "un ballon"
        pressure = _format_pressure(intervention.get("predilation_pressure"), "nominale")
        bullets.append(
            f"Pré-dilatation de la lésion par {balloon} qu'on inflate à {pressure}."
        )

    for i, st in enumerate(stents, 1):
        desc = _stent_full_desc(st)
        pressure = _format_pressure(st.get("pressure"), "nominale")
        if i == 1:
            bullets.append(
                f"Stenting de {artery}, par la mise en place d'un stent actif {desc} "
                f"qu'on inflate à {pressure}."
            )
        else:
            bullets.append(
                f"Mise en place d'un {i}ème stent actif {desc} en jointif, "
                f"qu'on inflate à {pressure}."
            )

    if intervention.get("postdilation"):
        balloon = intervention.get("postdilation_balloon") or "un ballon NC"
        pressure = _format_pressure(intervention.get("postdilation_pressure"), "infra-nominale")
        bullets.append(f"POT par {balloon} qu'on inflate à {pressure}.")

    timi = intervention.get("final_timi", 3)
    success = intervention.get("success", True)
    if success:
        bullets.append(
            "Au contrôle angiographique, bon déploiement du stent sans trait de dissection "
            f"visualisé ni de spasme avec persistance d'un flux antérograde {_timi(timi)}."
        )
    else:
        bullets.append(
            f"Résultat sous-optimal avec un flux coronaire {_timi(timi)}."
        )

    complications = (intervention.get("complications") or "").strip()
    if complications:
        bullets.append(f"Complication : {complications}.")

    extra = (intervention.get("notes") or "").strip()
    if extra:
        bullets.append(extra)

    return bullets


def build_atc_conclusion(interventions: list[dict]) -> list[str]:
    lines = []
    for iv in interventions:
        artery = iv.get("artery") or "l'artère cible"
        success = iv.get("success", True)
        stents = _parse_json_list(iv.get("stents"))
        verb = "Succès" if success else "Échec"
        tail = ", avec un bon résultat angiographique final." if success else "."
        if stents:
            descs = [_stent_full_desc(st) for st in stents]
            if len(descs) == 1:
                lines.append(
                    f"{verb} d'angioplastie de {artery} avec mise en place d'un stent actif {descs[0]}{tail}"
                )
            else:
                lines.append(
                    f"{verb} d'angioplastie de {artery} avec mise en place de {len(descs)} stents actifs en jointif : "
                    + " et ".join(descs) + tail
                )
        else:
            lines.append(f"{verb} d'angioplastie de {artery}{tail}")
    return lines


def build_atc_material_list(interventions: list[dict]) -> list[str]:
    """Aggregate ATC-specific material from all interventions (deduplicated, ordered)."""
    seen: list[str] = []

    def add(item: str):
        item = (item or "").strip()
        if item and item not in seen:
            seen.append(item)

    for iv in interventions:
        add(iv.get("guide_catheter"))
        for w in _parse_json_list(iv.get("wires")):
            add(w)
        if iv.get("predilation"):
            add(iv.get("predilation_balloon"))
        for st in _parse_json_list(iv.get("stents")):
            name = (st.get("name") or "").strip()
            d = st.get("diameter") or ""
            l = st.get("length") or ""
            mfr = (st.get("manufacturer") or "").strip()
            label = name
            if d and l:
                label = f"{label} {d} x {l} mm".strip()
            if mfr:
                label += f" ({mfr})"
            add(label)
        if iv.get("postdilation"):
            add(iv.get("postdilation_balloon"))
    return seen


def build_full_atc_text(full_report: dict) -> dict:
    interventions = full_report.get("interventions", []) or []
    narrative_blocks: list[list[str]] = []
    for iv in interventions:
        narrative_blocks.append(build_atc_intervention(iv))
    return {
        "atc_material": build_atc_material_list(interventions),
        "atc_narrative_blocks": narrative_blocks,
        "atc_conclusion_lines": build_atc_conclusion(interventions),
    }


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
        "conclusion_lines": build_conclusion_lines(lesions),
    }
