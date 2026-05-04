import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.phrase_builder import (
    build_tcg, build_iva, build_acd, build_cx, build_conclusion_lines
)

def test_tcg_normal():
    result = build_tcg([])
    assert "tronc commun" in result
    assert "sinus antéro-gauche" in result
    assert "lésion" not in result

def test_tcg_with_lesion():
    lesions = [{"artery": "TCG", "stenosis_pct": "50-70", "timi": 3, "good_distal_bed": True, "notes": ""}]
    result = build_tcg(lesions)
    assert "significative" in result
    assert "TIMI III" in result
    assert "bon lit d'aval" in result

def test_iva_with_calcification_no_lesion():
    result = build_iva([], calcified=True)
    assert "calcifiée" in result
    assert "lésion" not in result

def test_iva_with_proximal_lesion():
    lesions = [{"artery": "IVA_prox", "stenosis_pct": "70-90", "timi": 2, "good_distal_bed": False, "notes": "excentrée"}]
    result = build_iva(lesions)
    assert "serrée" in result
    assert "excentrée" in result
    assert "TIMI II" in result
    assert "lit d'aval altéré" in result

def test_conclusion_tri_tronculaire():
    lesions = [
        {"artery": "IVA_prox", "stenosis_pct": "70-90", "timi": 3, "good_distal_bed": True, "notes": ""},
        {"artery": "CX_dist",  "stenosis_pct": "50-70", "timi": 3, "good_distal_bed": True, "notes": ""},
        {"artery": "CD1",      "stenosis_pct": "90-99", "timi": 3, "good_distal_bed": True, "notes": ""},
    ]
    lines = build_conclusion_lines(lesions, "tri")
    assert lines[0] == "Lésions tri-tronculaires."
    assert len(lines) == 4

def test_acd_normal():
    result = build_acd([])
    assert "sinus antéro-droit" in result
    assert "lésion" not in result

def test_iva_normal_contains_boilerplate():
    result = build_iva([])
    assert "fait la pointe du cœur" in result
    assert "branches septales" in result
