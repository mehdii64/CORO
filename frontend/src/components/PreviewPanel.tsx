import type { FullReport } from "../types"

interface Props { full: FullReport }

const QUALIFIERS: Record<string, string> = {
  "50-70": "significative",
  "70-90": "serrée",
  "90-99": "très serrée",
  "100": "totalement occluse (CTO)",
}

function lesionSentence(l: FullReport["lesions"][0]): string {
  const q = QUALIFIERS[l.stenosis_pct] ?? "significative"
  const notes = l.notes ? ` (${l.notes})` : ""
  const timi = ["0", "I", "II", "III"][l.timi] ?? l.timi
  const bed = l.good_distal_bed ? "bon lit d'aval" : "lit d'aval altéré"
  return `${l.artery} : lésion ${q}${notes} (${l.stenosis_pct}%) — TIMI ${timi} — ${bed}.`
}

export default function PreviewPanel({ full }: Props) {
  const r = full.report
  const c = full.clinical
  const t = full.technique
  const concl = full.conclusion
  const lesions = full.lesions

  const tcgLesions = lesions.filter(l => l.artery === "TCG")
  const ivaLesions = lesions.filter(l => l.artery.startsWith("IVA"))
  const cxLesions  = lesions.filter(l => l.artery.startsWith("CX") || l.artery.startsWith("M"))
  const cdLesions  = lesions.filter(l => l.artery.startsWith("CD") || l.artery === "IVP" || l.artery === "RVP")

  return (
    <aside className="w-80 border-l bg-gray-50 overflow-y-auto p-4 text-xs leading-relaxed font-mono shrink-0">
      <p className="font-bold text-center text-sm mb-3 font-sans">Aperçu du compte rendu</p>

      <p><strong>Patient :</strong> {r.patient_name || "—"} — IPP : {r.ipp || "—"}</p>
      <p><strong>Date :</strong> {r.exam_date || "—"}</p>
      <p><strong>Indication :</strong> {r.indication || "—"}</p>

      {c && (
        <>
          <p className="mt-2"><strong>Âge :</strong> {c.age || "—"}</p>
          <p><strong>FDRCx :</strong> {JSON.parse(c.fdrcx || "[]").join(", ") || "—"}</p>
          <p><strong>ECG :</strong> {c.ecg || "—"}</p>
          <p><strong>ETT :</strong> FEVG {c.ett_fevg || "—"}%</p>
        </>
      )}

      {t && (
        <>
          <p className="mt-2"><strong>Salle :</strong> {t.room}</p>
          <p><strong>Voie :</strong> {t.approach} — {t.french_size}F</p>
          <p><strong>PDC :</strong> {t.contrast_cc || "—"} cc — Dose : {t.dose_mgy || "—"} mGy</p>
        </>
      )}

      <div className="mt-2 border-t pt-2">
        <p className="font-bold font-sans mb-1">CORONAROGRAPHIE</p>
        <p className="mb-1">
          <strong>TCG :</strong> calibre normal.
          {tcgLesions.map(l => <span key={l.id}> {lesionSentence(l)}</span>)}
        </p>
        <p className="mb-1">
          <strong>IVA :</strong> calibre normal, fait la pointe du cœur.
          {ivaLesions.map(l => <span key={l.id}> {lesionSentence(l)}</span>)}
        </p>
        <p className="mb-1">
          <strong>Cx :</strong> calibre normal.
          {cxLesions.map(l => <span key={l.id}> {lesionSentence(l)}</span>)}
        </p>
        <p className="mb-1">
          <strong>ACD :</strong> calibre normal.
          {cdLesions.map(l => <span key={l.id}> {lesionSentence(l)}</span>)}
        </p>
      </div>

      {concl && (
        <div className="mt-2 border-t pt-2">
          <p className="font-bold font-sans mb-1">CONCLUSION</p>
          <p>{concl.trunk_disease || "—"}</p>
          {lesions.map(l => <p key={l.id}>{lesionSentence(l)}</p>)}
          <p className="mt-1"><strong>Décision :</strong> {concl.decision || "—"}</p>
        </div>
      )}
    </aside>
  )
}
