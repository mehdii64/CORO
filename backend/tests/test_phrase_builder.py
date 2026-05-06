import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.phrase_builder import (
    build_tcg, build_iva, build_acd, build_cx, build_conclusion_lines
)


def _les(artery, pct, timi=3, notes="", occl_type=""):
    return {
        "artery": artery, "stenosis_pct": pct, "timi": timi,
        "good_distal_bed": True, "notes": notes, "occlusion_type": occl_type,
    }


def test_tcg_normal():
    result = build_tcg([])
    assert "tronc commun" in result
    assert "sinus antéro-gauche" in result
    assert "lésion" not in result


def test_tcg_with_lesion():
    result = build_tcg([_les("TCG", "50-70")])
    assert "intermédiaire" in result
    assert "TIMI III" in result
    assert "lit d'aval" not in result  # removed


def test_iva_with_calcification_no_lesion():
    result = build_iva([], calcified=True)
    assert "calcifiée" in result
    assert "lésion" not in result


def test_iva_with_proximal_lesion():
    result = build_iva([_les("IVA_prox", "70-90", timi=2, notes="excentrée")])
    assert "serrée" in result
    assert "excentrée" in result
    assert "TIMI II" in result
    assert "lit d'aval" not in result


def test_iva_subocclusive():
    result = build_iva([_les("IVA_moy", "90-99")])
    assert "sub-occlusive" in result


def test_acd_returns_string_normal():
    result = build_acd([])
    assert isinstance(result, str)
    assert "sinus antéro-droit" in result
    assert "lésion" not in result


def test_acd_with_lesion_acute_occlusion():
    result = build_acd([_les("CD1", "100", timi=0, occl_type="aigue")])
    assert "occlusion thrombotique aiguë" in result
    assert "TIMI 0" in result
    assert "totalement occluse" not in result
    assert "lit d'aval" not in result


def test_acd_with_chronic_occlusion_says_cto():
    result = build_acd([_les("CD2", "100", timi=0, occl_type="chronique")])
    assert "CTO" in result
    assert "chronique" in result
    assert "thrombotique" not in result


def test_acd_with_unspecified_occlusion_doesnt_say_cto():
    result = build_acd([_les("CD2", "100", timi=0, occl_type="")])
    assert "CTO" not in result
    assert "thrombotique" not in result
    assert "occlusion" in result


def test_conclusion_normal():
    lines = build_conclusion_lines([])
    assert lines == ["Artères coronaires sans lésions significatives."]


def test_conclusion_per_lesion():
    lesions = [
        _les("IVA_prox", "70-90"),
        _les("CX_dist", "50-70"),
        _les("CD1", "90-99"),
    ]
    lines = build_conclusion_lines(lesions)
    assert len(lines) == 3
    assert any("serrée" in l for l in lines)
    assert any("intermédiaire" in l for l in lines)
    assert any("sub-occlusive" in l for l in lines)
    assert all("lit d'aval" not in l for l in lines)


def test_conclusion_acute_occlusion():
    lines = build_conclusion_lines([_les("CD1", "100", timi=0, occl_type="aigue")])
    assert any("Occlusion thrombotique aiguë" in l for l in lines)


def test_iva_normal_contains_boilerplate():
    result = build_iva([])
    assert "fait la pointe du cœur" in result
    assert "branches septales" in result


def test_branch_singular_no_parens():
    result = build_iva([], n_diag=1)
    assert "1 branche diagonale" in result
    assert "(s)" not in result
    assert "branche(s)" not in result


def test_branch_plural_no_parens():
    result = build_iva([], n_diag=2)
    assert "2 branches diagonales" in result
    assert "(s)" not in result


def test_cx_branch_phrasing():
    assert "1 branche marginale principale" in build_cx([], n_marginales=1)
    assert "2 branches marginales principales" in build_cx([], n_marginales=2)
