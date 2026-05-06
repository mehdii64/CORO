import type { FullReport, Intervention, StentSpec, Lesion } from "../types"

interface Props { full: FullReport }

function parseList<T = string>(raw: string): T[] {
  try { return JSON.parse(raw || "[]") } catch { return [] }
}

function buildAtcBullets(iv: Intervention): string[] {
  const wires = parseList<string>(iv.wires)
  const stents = parseList<StentSpec>(iv.stents)
  const bullets: string[] = []
  const artery = iv.artery || "l'artère"

  bullets.push(iv.guide_catheter
    ? `Cannulation de ${artery} avec ${iv.guide_catheter}.`
    : `Cannulation de ${artery}.`)

  if (wires.length === 1) {
    bullets.push(`Mise en place d'un guide ${wires[0]} qui franchit la lésion.`)
  } else {
    wires.forEach((w, i) => bullets.push(`Mise en place du ${i + 1}${i === 0 ? "er" : "ème"} guide ${w}.`))
  }

  if (iv.predilation) {
    const b = iv.predilation_balloon || "ballon"
    const p = iv.predilation_pressure || "8 ATM x 20 sec"
    bullets.push(`Pré-dilatation par ${b} inflaté à ${p}.`)
  }

  stents.forEach((s, i) => {
    const desc = `${s.type || "actif"} ${s.name || ""} ${s.diameter}×${s.length} mm`.trim()
    const press = s.pressure ? ` (${s.pressure})` : ""
    bullets.push(i === 0
      ? `Stenting par stent ${desc}${press}.`
      : `${i + 1}ème stent ${desc}${press} (overlapping).`)
  })

  if (iv.postdilation) {
    const b = iv.postdilation_balloon || "ballon NC"
    const p = iv.postdilation_pressure || "8 ATM x 20 sec"
    bullets.push(`Post-dilatation par ${b} inflaté à ${p}.`)
  }

  const timi = ["0", "I", "II", "III"][iv.final_timi] ?? iv.final_timi
  bullets.push(iv.success
    ? `Bon résultat angiographique final, flux TIMI ${timi}.`
    : `Résultat sous-optimal, flux TIMI ${timi}.`)

  if (iv.complications) bullets.push(`Complication : ${iv.complications}.`)
  if (iv.notes) bullets.push(iv.notes)
  return bullets
}

const QUALIFIERS: Record<string, string> = {
  "50-70": "intermédiaire",
  "70-90": "serrée",
  "90-99": "sub-occlusive",
}

function lesionSentence(l: Lesion): string {
  const notes = l.notes ? ` (${l.notes})` : ""
  if (l.stenosis_pct === "100") {
    let descriptor = "occlusion"
    if (l.occlusion_type === "chronique") descriptor = "occlusion chronique (CTO)"
    else if (l.occlusion_type === "aigue") descriptor = "occlusion thrombotique aiguë"
    return `${l.artery} : ${descriptor}${notes} sans flux coronaire antérograde (TIMI 0).`
  }
  const q = QUALIFIERS[l.stenosis_pct] ?? "significative"
  const timi = ["0", "I", "II", "III"][l.timi] ?? l.timi
  return `${l.artery} : lésion ${q}${notes} (${l.stenosis_pct}%) — TIMI ${timi}.`
}

function pluralize(n: number, word: string): string {
  return n <= 1 ? `${n} ${word}` : `${n} ${word}s`
}

export default function PreviewPanel({ full }: Props) {
  const r = full.report
  const c = full.clinical
  const t = full.technique
  const concl = full.conclusion
  const lesions = full.lesions
  const interventions = full.interventions ?? []

  const reportType = r.type || "coro"
  const showCoro = reportType === "coro" || reportType === "coro+atc"
  const showAtc = reportType === "atc" || reportType === "coro+atc"

  const tcgLesions = lesions.filter(l => l.artery === "TCG")
  const ivaLesions = lesions.filter(l => l.artery.startsWith("IVA"))
  const cxLesions  = lesions.filter(l => l.artery.startsWith("CX") || l.artery.startsWith("M"))
  const cdLesions  = lesions.filter(l => l.artery.startsWith("CD") || l.artery === "IVP" || l.artery === "RVP")

  return (
    <aside className="w-80 border-l border-slate-200 bg-slate-50 overflow-y-auto shrink-0 flex flex-col">
      <div className="bg-blue-800 text-white px-4 py-3 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider">Aperçu du CR</p>
        <p className="text-xs text-blue-300 mt-0.5 truncate">{r.patient_name || "Patient non renseigné"}</p>
      </div>

      <div className="p-4 font-mono text-xs leading-relaxed text-slate-700 flex-1">

      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1.5 border-b border-blue-200 pb-1">Patient</p>
        <p><span className="font-semibold">Nom :</span> {r.patient_name || "—"}</p>
        <p><span className="font-semibold">Date :</span> {r.exam_date || "—"}</p>
        <p><span className="font-semibold">Indication :</span> {r.indication || "—"}</p>
      </div>

      {c && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1.5 border-b border-blue-200 pb-1">Statut clinique</p>
          <p><span className="font-semibold">Âge :</span> {c.age || "—"}</p>
          <p><span className="font-semibold">FDRCx :</span> {JSON.parse(c.fdrcx || "[]").join(", ") || "—"}</p>
          <p><span className="font-semibold">ECG :</span> {c.ecg || "—"}</p>
          <p>
            <span className="font-semibold">ETT :</span>{" "}
            {[c.ett_notes, c.ett_kinetics].filter(Boolean).join(" ") || "—"}
            {c.ett_fevg ? ` FEVG ${c.ett_fevg}%.` : ""}
          </p>
        </div>
      )}

      {t && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1.5 border-b border-blue-200 pb-1">Technique</p>
          <p><span className="font-semibold">Salle :</span> {t.room || "—"}</p>
          <p><span className="font-semibold">Voie :</span> {t.approach || "—"} — {t.french_size || "—"}F</p>
          <p><span className="font-semibold">PDC :</span> {t.contrast_cc || "—"} cc — Dose : {t.dose_mgy || "—"} mGy</p>
        </div>
      )}

      {showCoro && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1.5 border-b border-blue-200 pb-1">Coronarographie</p>
          <p className="mb-1">
            <span className="font-semibold">TCG :</span> calibre normal.
            {tcgLesions.map(l => <span key={l.id} className="text-amber-700"> {lesionSentence(l)}</span>)}
          </p>
          <p className="mb-1">
            <span className="font-semibold">IVA :</span> calibre normal, fait la pointe du cœur. Donne {pluralize(1, "branche diagonale")}.
            {ivaLesions.map(l => <span key={l.id} className="text-amber-700"> {lesionSentence(l)}</span>)}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Cx :</span> calibre normal, donne {pluralize(1, "branche marginale principale")}.
            {cxLesions.map(l => <span key={l.id} className="text-amber-700"> {lesionSentence(l)}</span>)}
          </p>
          <p className="font-semibold mt-2">Artère Coronaire Droite :</p>
          <p className="mb-1">
            L'artère coronaire droite se connecte au sinus antéro-droit, de calibre normal.
            {cdLesions.map(l => <span key={l.id} className="text-amber-700"> {lesionSentence(l)}</span>)}
          </p>
        </div>
      )}

      {showAtc && interventions.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <p className="font-bold font-sans mb-1">ANGIOPLASTIE</p>
          {interventions.map((iv, idx) => (
            <div key={iv.id} className="mb-2">
              <p className="font-semibold">Intervention {idx + 1} — {iv.artery || "—"}</p>
              {buildAtcBullets(iv).map((b, i) => (
                <p key={i} className="ml-2">• {b}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {concl && (
        <div className="mt-2 border-t pt-2">
          <p className="font-bold font-sans mb-1">CONCLUSION</p>
          {showCoro && (
            <>
              {lesions.length === 0 && <p>Artères coronaires sans lésions significatives.</p>}
              {lesions.map(l => <p key={l.id}>{lesionSentence(l)}</p>)}
            </>
          )}
          {showAtc && interventions.map((iv, idx) => {
            const stents = parseList<StentSpec>(iv.stents)
            const stentList = stents.map(s => `${s.name} ${s.diameter}×${s.length}mm`).join(", ")
            const verb = iv.success ? "Succès" : "Échec"
            return (
              <p key={iv.id}>
                {idx + 1}. {verb} d'angioplastie de {iv.artery}
                {stents.length > 0 && ` — stent${stents.length > 1 ? "s" : ""} : ${stentList}`}.
              </p>
            )
          })}
          <p className="mt-1"><strong>Décision :</strong> {concl.decision || "—"}</p>
        </div>
      )}
      </div>
    </aside>
  )
}
